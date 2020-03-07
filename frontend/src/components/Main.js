import React from "react";
import { Form, Jumbotron, Button, Alert } from 'react-bootstrap'
import axios from "axios";
import "./Main.css";

const API_URI = "http://localhost:5000";

export default class Main extends React.Component {
    constructor(){
        super();
        this.state = {
            address: null,
            outlet: null,
            error: null,
            errorInfo: null,
        };
        this._onChange = this._onChange.bind(this);
        this.getAddress = this.getAddress.bind(this);
    }

    _onChange(e) {
        this.setState({address: e.target.value, error: null, errorInfo: null, outlet: null});
    }

    getAddress() {
        this.requestOutlet(this.state.address);
    }

    async requestOutlet(address) {
        try {
            const response = await axios.post(
                API_URI,
                {
                    userLocation: address,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                },
            );
            console.log(response);
            this.setState({outlet: response.data.location})
        } catch (error) {
            console.log(error.response);
            this.setState({
                error: error,
                errorInfo: error.response.data.error
            });
        }

    }

    render (){
        return (
            <div className="portlet">
                <Form>
                    <Form.Group controlId="formBasicAddress">
                        <Form.Label> Delivery Address</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter Delivery Address"
                            onChange={this._onChange}
                        />
                        <Form.Text className="text-muted">
                            Please enter your full delivery address
                        </Form.Text>
                        <Button variant="primary" size="lg" block onClick={this.getAddress}>
                            Get Outlet
                        </Button>
                    </Form.Group>
                </Form>
                <div className="outletDetails">
                    {this.state.error &&
                        <Alert variant="danger">
                            {this.state.errorInfo}
                        </Alert>
                    }
                    <Jumbotron>
                        <p>Nearest Delivery Location:</p>
                        <h1>{this.state.outlet}</h1>
                    </Jumbotron>
                </div>
            </div>
        );
    };
}