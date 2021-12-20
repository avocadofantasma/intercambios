import React from 'react';
import axios from 'axios';

import Participant from './Participant.component';

import 'materialize-css';
import { Button, Card, Row, Col } from 'react-materialize';

const URL = `http://${window.location.hostname}:3000`

class Participants extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            persons: []
        }

        this.handleSeenClick = this.handleSeenClick.bind(this);
    }

    renderNames(persons, handleSeenClick) {
        return (
            persons.map(person => <Participant person={person} handleSeenClick={handleSeenClick} />)
        )
    }

    handleSeenClick(name) {
        setTimeout(() => {
            axios.post(`${URL}/seen/${name}`)
                .then(res => {
                    const persons = res.data;
                    this.setState({ persons });
                })
        }, 1000);
    }

    componentDidMount() {
        axios.get(`${URL}/matches`)
            .then(res => {
                const persons = res.data;
                this.setState({ persons });
            })
    }

    render() {
        return (
            <div className="container">
                <div className="row">
                    <h4>Participantes: {this.state.persons.length} </h4>
                </div>
                <div className="row">
                    {this.renderNames(this.state.persons, this.handleSeenClick)}
                </div>
            </div>
        )
    }
}

export default Participants;
