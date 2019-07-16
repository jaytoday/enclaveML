import React from 'react';
import { Layout, Row, Col, Button, Card } from 'antd';
import { IMAGE_H, IMAGE_W, NUM_TRAIN_ELEMENTS, PatternRecognitionData } from './dataset';
import { getModel } from './model';
import CanvasDraw from "react-canvas-draw";
import StatusChart from '../components/StatusChart';
import Collapse from './Collapse';
import * as tf from '@tensorflow/tfjs';

class PatternRecognitionDemo extends React.Component {

    constructor() {
        super();
        this.state = {
            dataLoaded: false,
            dataLoading: true,
            training: false,
            trained: false,
            trainingStatus: null,
            errorData: [],
            errorValData: [],
            accData: [],
            accValData: [],
            prediction: null,
            predictionScore: null,
            clients: 0,
            currentEpoch: 0
        }
        this.predCanvas = React.createRef();
    }
    
    componentDidMount = async () => {
        if (!this.state.datasetLoaded) this.loadData();
    }

    loadData = async () => {
        this.setState({ dataLoading: true });
        this.data = new PatternRecognitionData();
        await this.data.load();
        this.setState({ dataLoaded: true, dataLoading: false });
    }

    train = async () => {
        this.setState({ training: true, trainingStatus: 'Training model...' });
        this.model = getModel();

        const batchSize = 550;
        const validationSplit = 0.15;
        const trainEpochs = 3;

        const trainData = this.data.getTrainData();
        const testData = this.data.getTestData();

        const totalBatches = Math.ceil(NUM_TRAIN_ELEMENTS * (1 - validationSplit) / batchSize) * trainEpochs;
        
        await this.model.fit(trainData.xs, trainData.labels, {
            batchSize,
            validationSplit,
            epochs: trainEpochs,
            callbacks: {
                onBatchEnd: async (batch, logs) => {
                    const clients = this.state.clients || 0;
                    this.setState({
                        status: `Training... (${((clients + 1) / totalBatches * 100).toFixed(1)}% complete)`,
                        clients: clients + 1, 
                        errorData: this.state.errorData.concat(logs.loss),
                        accData: this.state.accData.concat(logs.acc)
                    });
                    await tf.nextFrame();
                },
                onEpochEnd: async (epoch, logs) => {
                    this.setState({
                        errorValData: this.state.errorValData.concat([[this.state.clients, logs.val_loss]]),
                        currentEpoch: this.state.currentEpoch + 1, 
                        accValData: this.state.accValData.concat([[this.state.clients, logs.val_acc]])
                    });
                    await tf.nextFrame();
                }
            }
        });

        const testResult = this.model.evaluate(testData.xs, testData.labels);
        const testAccPercent = testResult[1].dataSync()[0] * 100;

        this.setState({
            trained: true,
            status: `Final test accuracy: ${testAccPercent.toFixed(1)}%`
        });
    }

    getImageData = () => {
        const currentContext = this.predCanvas.current.getContext('2d');
        currentContext.clearRect(0, 0, IMAGE_W, IMAGE_H);
        currentContext.drawImage(this.drawCanvas.canvas.drawing, 0, 0, IMAGE_W, IMAGE_H);
        const imgData = currentContext.getImageData(0, 0, IMAGE_W, IMAGE_H);

        let img = tf.browser.fromPixels(imgData, 1)
        img = img.reshape([1, 28, 28, 1]);
        img = tf.cast(img, 'float32');
        return img.div(tf.scalar(255));
    }

    predict = async () => {
        await tf.tidy(() => {
            const imgData = this.getImageData()
            const outputObj = this.model.predict(imgData).dataSync();
            const output = Array.from(outputObj);

            const prediction = output.indexOf(Math.max(...output));
            const predictionScore = output[prediction] * 100;

            console.log(output);
            console.log(prediction);
            console.log(predictionScore);

            this.setState({ prediction: prediction, predictionScore: predictionScore.toFixed(1) });
        });
    }

    clearCanvas = () => {
        this.drawCanvas.clear();
        const currentContext = this.predCanvas.current.getContext('2d');
        currentContext.clearRect(0, 0, IMAGE_W, IMAGE_H);
        this.setState({ prediction: null, predictionScore: null });
    }

    render() {
        const { errorData, accData, prediction, trained, training, status, dataLoading } = this.state;
        
        const trainingStatus =  (<Row>
                                {this.state.clients > 0 && <Row><h4>Federated Clients: {this.state.clients}</h4> </Row>}
                                {errorData.length > 0 &&
                                    <Col>
                                        <StatusChart
                                            title="Prediction Error"
                                            trainData={errorData}
                                            valData={this.state.errorValData}
                                            yTitle="error"
                                        />
                                    </Col>
                                }
                              
                                {accData.length > 0 &&
                                    <Col>
                                        <StatusChart
                                            title="Prediction Accuracy"
                                            trainData={accData}
                                            valData={this.state.accValData}
                                            yTitle="accuracy"
                                        />
                                    </Col>
                                }
                            </Row>);
                            
        const trainingResults = trained && (
              <Row>
                  <Col>
                          <Card>
                            
                              <span style={{ display: 'inline', float: 'right', verticalAlign: 'top' }}>
                                  <Button compact
                                      content='Clear'
                                      onClick={this.clearCanvas}
                                      size='small'
                                  />
                                  <Button compact positive
                                      content={'Predict'}
                                      onClick={this.predict}
                                      size='small'
                                  />
                              </span>
                          </Card>
                          <Card style={{ padding: 0 }}>
                              <CanvasDraw
                                  ref={canvasDraw => (this.drawCanvas = canvasDraw)}
                                  lazyRadius={0}
                                  brushRadius={40}
                                  canvasWidth={"100%"}
                                  canvasHeight={540}
                              />
                          </Card>
                  </Col>
                  <Col>
                      
                          <Card><b>Prediction</b></Card>
                          <Card style={{ height: 540 }}>
              
                                  <Card type="inner">
                                      <Layout.Content verticalAlign='top'>
                                          <div className='item-header'>{
                                              prediction !== null
                                                  ? "Neural network input (28 x 28 pixels):"
                                                  : "Draw any number and press 'Predict'."
                                          }
                                        </div>
                                          <canvas ref={this.predCanvas} width={28} height={28} />
                                      </Layout.Content>
                                  </Card>
                                  {prediction !== null &&
                                      <Card  type="inner">
                                          <Layout.Content verticalAlign='middle'>
                                              <div className='item-header'>
                                                  Prediction: {prediction}
                                              </div>
                                          </Layout.Content>
                                      </Card>
                                  }
                                  {prediction !== null &&
                                      <Card type="inner">
                                          <Layout.Content verticalAlign='middle'>
                                              <div className='item-header'>
                                                  Prediction accuracy: {this.state.predictionScore}%
                                              </div>
                                          </Layout.Content>
                                      </Card>
                                  }
                          </Card>
                  </Col>
              </Row>
        );
        
        
        return (
            <Layout.Content style={{ padding: '5em 0em' }}>
              <Row>
               <Col span={12} offset={4}>
                <Collapse
                  trainingStatus={trainingStatus} 
                  trainingResults={trainingResults}
                  dataLoading={dataLoading}
                  loadData={this.loadData}
                  train={this.train}
                  training={training}
                />
              </Col>
            </Row>
            </Layout.Content>
        );
    }
    
    
}

export default PatternRecognitionDemo;


/*

*/
