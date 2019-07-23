import React from 'react';
import { Button, Form } from 'antd';

const Results = props => (
    <Form>
          {props.datasetLoading && <div>Loading...</div>}

            {!props.datasetLoading && !props.training &&
                <Button
                    labelPosition='right'
                    onClick={props.train}
                >Start Training</Button>
            }

            {props.trainingStatus &&
                <Form.Item style={{ alignSelf: 'flex-end', marginBottom: 2 }}>
                    {props.trainingStatus}
                </Form.Item>
            }
    </Form>
);

export default Results;