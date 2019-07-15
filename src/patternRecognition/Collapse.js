import React, { Component } from 'react';
import { Collapse, Icon } from 'antd';
import datasetExample from './dataset.png';
import Results from './Results';

const CollapseInfo = props => (
            <div style={{ paddingBottom: 20 }}>
                <Collapse defaultActiveKey={['1']} accordian>
                    <Collapse.Panel header="Pattern Recognition Demo" key="1">
                        <p>
                            This proof-of-concept demonstrates federated learning on a pattern recognition model using handwritten numerical images stored on the client.
                        </p>
                        <p>More info <a href='http://yann.lecun.com/exdb/mnist/' target="_blank" rel="noopener noreferrer">More info on NIST</a>.</p>
                        <Results
                            dataLoading={props.dataLoading}
                            loadData={props.loadData}
                            train={props.train}
                            training={props.training}
                            trainingStatus={props.trainingStatus}
                        />
                    </Collapse.Panel>
                </Collapse>
            </div>
);


export default CollapseInfo;
