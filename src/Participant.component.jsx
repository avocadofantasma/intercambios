import React, { useState } from 'react';
import 'materialize-css';
import { Button, Card, Icon, Row, Col } from 'react-materialize';

function Participant({ person, handleSeenClick }) {
    const [seen, setSeen] = useState(person.seen);

    const onClickHandler = () => {
        setSeen(true)
        handleSeenClick(person.name)
        window.alert(`${person.name} Le regalas a ${person.match}`)
        window.close()

    }

    const renderTitle = () => {
        return seen ? `${person.name} le regalas a:  ${person.match}` : person.name;
    }
    const cls = seen ? 'green lighten-3' : 'blue lighten-3'

    return person.seen == false && (
        <div className="col s12 m12 l4">
            <Card
                className={cls}
                closeIcon={<Icon>close</Icon>}
                onClick={onClickHandler}
                revealIcon={<Icon>more_vert</Icon>}
                textClassName="white-text"
                title={renderTitle()}
            />
        </div>
    );
}

export default Participant;