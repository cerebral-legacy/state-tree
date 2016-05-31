var React = require('react');

module.exports = React.createClass({
  displayName: 'CerebralContainer',
  childContextTypes: {
    tree: React.PropTypes.object.isRequired
  },
  getChildContext: function () {
    return {
      tree: this.props.tree
    }
  },
  render: function () {
    return React.DOM.div(this.props);
  }
})
