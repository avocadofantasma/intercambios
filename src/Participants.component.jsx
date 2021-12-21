import React from 'react';
import axios from 'axios';

import Participant from './Participant.component';

import 'materialize-css';
import { Button, Card, Row, Col } from 'react-materialize';

const PORT = process.env.PORT || 3000;
const URL = `https://${window.location.hostname}:${PORT}`

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
        axios.post(`/seen/${name}`)
            .then(res => {
                const persons = res.data;
                this.setState({ persons });
            })
    }

    componentDidMount() {
        axios.get(`/matches`)
            .then(res => {
                const persons = res.data;
                this.setState({ persons });
            })
    }

    render() {
        return (
            <div className="container">
                <div className="row">
                    <h5>Participantes: {this.state.persons.length} / Faltantes: {this.state.persons.filter(e => !e.seen).length}</h5>
                </div>
                <div className="row">
                    {this.renderNames(this.state.persons, this.handleSeenClick)}
                </div>
            </div>
        )
    }
}

export default Participants;
