import './squarecat.css';

import React, { Component, Fragment } from 'react';

import colin from '../../images/colin.png';

export default class SquarecatWidget extends Component {
  state = {
    showBubble: false
  };
  render() {
    const { showBubble } = this.state;
    return (
      <Fragment>
        <div
          ref={r => {
            this.ref = r;
          }}
          className={`squarecat-widget__bubble ${
            showBubble ? 'squarecat-widget__bubble--shown' : ''
          }`}
        >
          <div className="container">
            <p>
              Hey{' '}
              <span role="img" aria-label="wave-emoji">
                👋
              </span>
              . We're <a href="https://twitter.com/jamesivings">James</a> &{' '}
              <a href="https://twitter.com/dinkydani21">Danielle</a> from
              Squarecat, a pair of travelling makers. We write software to help
              people because it's rewarding and we love doing it, which we think
              is a good reason to do just about anything.
            </p>
            <p>
              Come check out the rest of our work at{' '}
              <a href="https://squarecat.io">squarecat.io</a>!
            </p>
          </div>
        </div>
        <a className="squarecat-widget" onClick={this.onClick}>
          <span className="meow">Meow</span>
          <span className="meow meow-right">Meow</span>
          <img
            alt="The creators"
            src={colin}
            className="squarecat-widget__colin"
          />
        </a>
      </Fragment>
    );
  }
  onClick = () => {
    const isShown = this.state.showBubble;
    const $main = document.getElementById('main');
    if (isShown) {
      $main.style.height = '100%';
      $main.scrollTop = $main.scrollTop - this.ref.offsetHeight;
    } else {
      $main.style.height = `calc(100% - ${this.ref.offsetHeight}px)`;
      $main.scrollTop = $main.scrollTop + this.ref.offsetHeight;
    }
    this.setState({ showBubble: !isShown });
  };
}
