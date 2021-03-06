import React from 'react';
import { View, Dimensions, PanResponder, Platform, Modal, TouchableOpacity, Text } from 'react-native';
import { Provider, connect } from 'react-redux';
import { createStore } from 'redux';
import rootReducer from '@redux';
import AppNavigation from 'navigation';
import { createAppContainer } from 'react-navigation';
import AsyncStorage from '@react-native-community/async-storage';
import { Helper } from 'common';
import SystemVersion from 'services/System.js';
const AppContainer = createAppContainer(AppNavigation);
const height = Math.round(Dimensions.get('window').height);
const width = Math.round(Dimensions.get('window').width);
import BackgroundTimer from 'react-native-background-timer';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import ModalFooter from 'modules/generic/SecurityAlert';
import { Color, BasicStyles } from 'common'
import { navigationRef } from 'modules/generic/SecurityAlert';
class ReduxNavigation extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      timer: false,
      timeForInactivityInSecond: 1,
      interval: null,
      showModal: false
    }
    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponderCapture: () => {
        // console.log('user starts touch');
        this.resetInactivityTimeout()
      },
    })
  }


  componentDidMount(){
    this.getTheme()
    SystemVersion.checkVersion(response => {
      this.setState({isLoading: false})
      if(response == true){
      }
    })
  }

  getTheme = async () => {
    try {
      const primary = await AsyncStorage.getItem(Helper.APP_NAME + 'primary');
      const secondary = await AsyncStorage.getItem(Helper.APP_NAME + 'secondary');
      const tertiary = await AsyncStorage.getItem(Helper.APP_NAME + 'tertiary');
      const fourth = await AsyncStorage.getItem(Helper.APP_NAME + 'fourth');
      const index = await AsyncStorage.getItem(Helper.APP_NAME + 'index');
      if(primary != null && secondary != null && tertiary != null) {
        const { setTheme } = this.props;
        setTheme({
          primary: primary,
          secondary: secondary,
          tertiary: tertiary,
          fourth: fourth,
          index: index
        })
      }
    } catch (e) {
      console.log(e)
    }
  }


  onOpenNotification = (notify) => {
    console.log("[App] onOpenNotification", notify )
  }

  incrementTime = () => {
    console.log(this.state.timer)
    this.setState({
      timer: this.state.timer + 1
    })
  }

  resetInactivityTimeout = () => {
    const { timer } = this.state;
    const { user } = this.props.state;

    if(user == null){
      return
    }

    if(timer > 10){
      console.log('show modal here')
      this.setState({
        showModal: true
      })
    }else{
      BackgroundTimer.stopBackgroundTimer()
      
      this.setState({
        timer: 0
      })

      BackgroundTimer.runBackgroundTimer(() => { 
        this.incrementTime() 
      }, 1000);
    }
    
  }

  render(){
    const { acceptPayment, user, theme } = this.props.state
    const { showModal } = this.state;
    return (
      <View style={{
        flex: 1
      }}
      {...this.panResponder.panHandlers}
      >
        <AppContainer ref={navigationRef}/>
          {
            showModal && (
              <Modal visible={showModal}>
                <View style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  flex: 1
                }}>
                  <View style={{
                    minHeight: 100,
                    paddingLeft: 10,
                    paddingRight: 10,
                    paddingTop: 20,
                    paddingBottom: 20,
                    borderRadius: 12,
                    width: '80%',
                    marginRight: '10%',
                    marginLeft: '10%',
                    backgroundColor: 'white'
                  }}>

                      {
                        /*Action buttons*/
                      }

                      <View style={{
                        width: '100%',
                        alignItems: 'center'
                      }}>
                        <FontAwesomeIcon icon={faExclamationTriangle} size={50} color={Color.danger}/>
                      </View>

                      <Text style={{
                        fontSize: 16,
                        fontWeight: 'bold',
                        paddingTop: 10,
                        textAlign: 'center',
                      }}>
                        Security Alert!
                      </Text>

                      <Text style={{
                        fontSize: 14,
                        fontWeight: 'bold',
                        paddingTop: 50,
                        paddingBottom: 50,
                        textAlign: 'center',
                        paddingLeft: 20,
                        paddingRight: 20,
                        color: Color.danger
                      }}>
                        You've have been away for the passed minutes. We want to make sure it's you!
                      </Text>

                      <ModalFooter
                        reset={() => {
                          this.setState({
                            showModal: false,
                            timer: 0
                          })
                          this.props.logout()
                          navigationRef.current?._navigation.navigate('loginStack')
                        }}
                        resetInactivityTimeout={() => {
                          this.setState({
                            showModal: false,
                            timer: 0
                          })
                          this.resetInactivityTimeout()
                        }}/>
                  </View>
                </View>

              </Modal>
            )
          }
      </View>
    )
  }
}

const mapStateToProps = state => ({ state: state })
const mapDispatchToProps = dispatch => {
  const { actions } = require('@redux');
  return {
    setTheme: (theme) => dispatch(actions.setTheme(theme)),
    setUnReadMessages: (messages) => dispatch(actions.setUnReadMessages(messages)),
    updateMessagesOnGroup: (message) => dispatch(actions.updateMessagesOnGroup(message)),
    logout: () => dispatch(actions.logout()),
    setActiveRoute: (route) => dispatch(actions.setActiveRoute(route))
  };
};
let AppReduxNavigation = connect(mapStateToProps, mapDispatchToProps)(ReduxNavigation)
const store = createStore(rootReducer);

export default class App extends React.Component{
  constructor(props) {
    super(props);
  }

  render() {
    console.ignoredYellowBox = ['Warning: Each'];
    return (
      <Provider store={store}>
        <View style={{
            flex: 1,
            backgroundColor: '#ffffff'
          }}>
            <AppReduxNavigation {...this.props}/>
        </View>
      </Provider>
    );
  }
}