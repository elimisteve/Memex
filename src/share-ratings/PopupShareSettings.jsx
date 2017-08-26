import React, { Component } from 'react'

import styles from './PopupShareSettings.css'

import minixhr from 'minixhr'


//var chris_up = require('../../img/worldbrain-logo.png'); // Tell Webpack this JS file uses this image


const apiUrl = 'https://api.graph.cool/simple/v1/cj6smhqc40ehh0184ghuupaok'

const friends = ['cj6ssbxge5ro201641e08gdt9']/*
    'cj6ssbxgc9ro201641e08gdt9',
    'cj6so9jvh0h830156udspa1hd',
    'cj6sxz9o1iyrc0143ob0kre90',
    'cj6t2y4muraug01431glom6nm',
    'cj6t2xr4kqkry0162oj6wrmve',
    'cj6t62xnnvq170179dxpbppj9']
    */

class PopupShareSettings extends Component {
    constructor() {
        super()
        this.state = {}
        this.state.up = 0
        this.state.down = 0
        //this.ural = 'fj'
    }

    renderChildren() {
        if(!this.state.ratings){return(<div></div>)}
        //return (<div>{JSON.stringify(this.state.ratings.data.allRatings)}</div>)
        return this.state.ratings.data.allRatings.map((rating,i)=>{
            console.log('rating: ', rating.person.name)
            return(<li key={i} className={styles.userEntry}>
                        
                        {(rating.rating === 1)? '+1' : '-1'}
                        <div className={styles.userName}>
                            {rating.person.name}
                        </div>
                    </li>)
        })
    }

    rate(rating) {
        this.getRatings();
        if (!rating) rating = 0
        var url = ''
        chrome.tabs.getSelected(null, tab => {
            url = tab.url
        })

        chrome.storage.local.get('worldbrain_user', data => {
            const user = data.worldbrain_user
            if (user && user.name && user.id) {
                const request = {
                    url: apiUrl,
                    method: 'POST',
                    data: JSON.stringify({query: `mutation{createRating(personId:"${user.id}", rating:${rating}, urlHash:"${url}") {
                      id
                    }}`}),
                    headers: {'Content-Type': 'application/json'},
                }
                minixhr(request, (data, res, xhr, header) => {
                    data = JSON.parse(data)
                })
            } else {
                console.log('Please provide a username.')
            }
        })
    }

    getRatings(){
        var url = ''
        chrome.tabs.getSelected(null, tab => {
            url = tab.url
            const request = {
                url: apiUrl,
                method: 'POST',
                data: JSON.stringify({query: `{allRatings (filter: {AND:[{urlHash: "${url}"},{person: {id_not_in: ["${friends.join('","')}"] }}]}) {rating urlHash person{name}} }`}),
                headers: {'Content-Type': 'application/json'},
            }
            minixhr(request, (data, res, xhr, header) => {
                data = JSON.parse(data)
                this.setState({ratings:data})
                var up = 0;
                var down = 0;
                console.log(data)
                //if(!data.allRatings)return
                data.data.allRatings.map((rating,i)=>{if (rating.rating === 1) up++; if(rating.rating === -1) down++})
                this.setState({up:up,down:down})
                //console.log(up,down)
            })
        })
    }

    componentDidMount() {
        this.getRatings()
    }

    render() {
        return (
            <div>
                <h3 className={styles.title}>Ratings from your Network</h3>
                <hr />
                <div className={styles.votesContainer}>
                    <a className={`${styles.voteField} ${styles.voteButton}`} onClick={()=>{this.rate(1)}} >
                        <i className='material-icons'>keyboard_arrow_up</i>
                    </a>
                    <div className={styles.voteField}>{this.state.up ? this.state.up : ''}</div>
                    <div className={styles.voteField}>{this.state.down ? this.state.down : ''}</div>
                    <a className={`${styles.voteField} ${styles.voteButton}`} onClick={()=>{this.rate(-1)}} >
                        <i className='material-icons'>keyboard_arrow_down</i>
                    </a>
                </div>
                <ul className={styles.usersList}>
                {this.renderChildren()}
                </ul>
            </div>
        )
    }
}

export default PopupShareSettings