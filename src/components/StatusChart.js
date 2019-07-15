import React from 'react';
import Highcharts from 'highcharts';
import { Row, Card } from 'antd';

class StatusChart extends React.Component {

    constructor(props) {
        super(props);
        this.chart = null;
        this.id = 'chart' + Math.random();
        this.updateStep = props.updateStep || 10;
    }

    componentDidUpdate(prevProps) {
        const { trainData, valData } = this.props;
        if (prevProps.trainData !== trainData && (trainData.length % this.updateStep === 0)) {
            this.chart.series[0].update({ data: trainData });
        }

        if (prevProps.valData !== valData) {
            this.chart.series[1].update({ data: valData });
        }
    }

    componentDidMount() {
        const { trainData, valData, yTitle, xTitle } = this.props
        const options = {
            chart: {
                type: 'line',
                height: 250,
            },
            credits: {
                enabled: false
            },
            title: {
                text: ''
            },
            xAxis: {
                enabled: true,
                title: {
                    text: xTitle || 'batch'
                }
            },
            yAxis: {
                title: {
                    text: yTitle
                },
                minPadding: 0,
                maxPadding: 0
            },
            legend: {
                enabled: valData ? true : false,
            },
            exporting: {
                enabled: false
            },
            plotOptions: {
                series: {
                    lineWidth: 1,
                    marker: {
                        enabled: false
                    }
                }
            },
            series: [
                { id: 'train', name: 'Prediction', data: trainData },
                (valData ? { id: 'val', name: 'Validation', data: valData } : false)
            ].filter(Boolean)
        };
        this.chart = new Highcharts.chart(this.id, options);
    }

    componentWillUnmount() {
        this.chart.destroy();
    }

    render() {
        return (
                <Row>
                <Card><b>{this.props.title}</b></Card>
                <Card style={{ padding: 0 }}>
                    <div id={this.id} />
                </Card>
                </Row>
        );
    }

}

export default StatusChart;
