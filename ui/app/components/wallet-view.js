const Component = require('react').Component
const connect = require('react-redux').connect
const h = require('react-hyperscript')
const inherits = require('util').inherits
const Identicon = require('./identicon')
const AccountDropdowns = require('./account-dropdowns').AccountDropdowns

module.exports = connect(mapStateToProps)(WalletView)

function mapStateToProps (state) {
  return {
    network: state.metamask.network,
  }
}


inherits(WalletView, Component)
function WalletView () {
  Component.call(this)
}

const noop = () => {}

WalletView.prototype.render = function () {
  const selected = '0x82df11beb942BEeeD58d466fCb0F0791365C7684'
  const { network } = this.props

  return h('div.wallet-view.flex-column', {
    style: {
      flexGrow: 1,
      height: '82vh',
      background: '#FAFAFA',
    }
  }, [

    h('div.flex-row.flex-center', {
      style: {
        marginLeft: '35px',
        marginRight: '35px',
        marginTop: '35px',
      }
    }, [

      h('.identicon-wrapper.select-none', [
        h(Identicon, {
          diameter: 24,
          address: selected,
        }),
      ]),

      h('span', {
        style: {
          fontSize: '1.5em',
          marginLeft: '10px', // TODO: switch all units for this component to em
        }
      }, [
        'Account 1'
      ]),

      h(
        AccountDropdowns,
        {
          style: {
            marginRight: '8px',
            marginLeft: 'auto',
            cursor: 'pointer',
          },
          selected,
          network, // TODO: this prop could be in the account dropdown container
          identities: {},
        },
      ),

    ])

    // wallet display 1
    // token display 1

  ])
}
