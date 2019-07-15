import React from 'react';
import { Layout, Card, Collapse, Button, Row, Col } from 'antd';
import Webcam from 'react-webcam';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

const BORDER_COLOR = '#031d6a';
const LABEL_COLOR = '#ffffff';

class WebcamDemo extends React.Component {

    constructor() {
        super();
        this.state = {
            loaded: false,
            loading: false,
            activeIndex: 0,
            clients: 0
        }
        this.cam = null;
        this.canvasRef = React.createRef();
    }

    
    loadModel = async () => {
      console.log('loading');
        this.setState({ loading: true });
        this.addClient();
        this.model = await cocoSsd.load();
    }

    detectFrame = () => {
        if (!this.cam){
          console.log('webcam not available');
          return null;
        }
        
        this.model.detect(this.cam.video)
            .then(predictions => {
                this.renderPredictions(predictions);
                requestAnimationFrame(() => this.detectFrame());
            });
    }

    renderPredictions = predictions => {
      if (!this.cam){
        console.log('webcam not available');
        return null;
      }
        const ctx = this.canvasRef.current.getContext("2d");
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.font = "16px sans-serif";
        ctx.textBaseline = "top";
        predictions.forEach(prediction => {
            const [x, y, width, height] = prediction.bbox;
            // Bounding box
            ctx.strokeStyle = BORDER_COLOR;
            ctx.lineWidth = 4;
            ctx.strokeRect(x, y, width, height);
            // Label background
            ctx.fillStyle = BORDER_COLOR;
            const textWidth = ctx.measureText(prediction.class).width;
            ctx.fillRect(x, y, textWidth + 4, 20);
            // Label text
            ctx.fillStyle = LABEL_COLOR;
            ctx.fillText(prediction.class, x, y);
        });
    }

    addClient = () => {
      this.setState({ clients: this.state.clients + 1});
      if (this.state.clients > 100){
        this.setState({ loaded: true, loading: false }, () => this.detectFrame());
      }else{ 
        setTimeout(this.addClient, 50);
      }
      
    }
    
    
    onAccordionClick = (e, titleProps) => {
        const { index } = titleProps;
        const { activeIndex } = this.state;
        this.setState({ activeIndex: activeIndex === index ? -1 : index })
    }

    render() {
        const { loaded, loading, activeIndex, clients } = this.state;
        
        const Accordian = (
          <div style={{ paddingBottom: 20 }}>
              <Collapse defaultActiveKey={['1']} accordian>
                
                  <Collapse.Panel header="Webcam Object Detection" key="1">
                      <p>
                          This webcam demo simulates federated learning training of a Single Shot MultiBox Detection object recognition model. 
                      </p>
                      
                      
                      {loaded &&
                          <Row><Col>
                            <Card style={{ position: 'relative', height: 540, width: 680, padding: 8 }} raised>
                              <canvas
                                  ref={this.canvasRef}
                                  style={{ position: 'absolute' }}
                                  width="640"
                                  height="510"
                              />
                              <Webcam
                                  ref={webcam => { this.cam = webcam }}
                                  audio={false}
                              />
                          </Card>
                          </Col></Row>
                      }
                    
                  </Collapse.Panel>
              </Collapse>
            </div>
        );
        
        return (
            <Layout.Content style={{ padding: '5em 0em' }}>
              <Row>
                <Col span={12} offset={2}>
              
                {!loaded && !loading && <Button onClick={this.loadModel}>Load Webcam Demo</Button>}
                {loading && <Row><h4>Federated Clients: {clients}</h4></Row>}
                {loaded && Accordian}
                </Col>
            </Row>
                
            </Layout.Content>
        );
    }
}

export default WebcamDemo;

