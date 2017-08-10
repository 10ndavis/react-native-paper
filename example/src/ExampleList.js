/* @flow */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ListView, Text, StyleSheet, View } from 'react-native';
import { TouchableRipple, Divider, withTheme } from 'react-native-paper';
import ButtonExample from './ButtonExample';
import FABExample from './FABExample';
import CardExample from './CardExample';
import CheckboxExample from './CheckboxExample';
import DividerExample from './DividerExample';
import GridViewExample from './GridViewExample';
import PaperExample from './PaperExample';
import RippleExample from './RippleExample';
import RadioButtonExample from './RadioButtonExample';
import TextExample from './TextExample';
import ToolbarExample from './ToolbarExample';
import SearchBarExample from './SearchBarExample';

export const examples = {
  button: ButtonExample,
  fab: FABExample,
  card: CardExample,
  checkbox: CheckboxExample,
  divider: DividerExample,
  grid: GridViewExample,
  paper: PaperExample,
  ripple: RippleExample,
  radio: RadioButtonExample,
  toolbar: ToolbarExample,
  text: TextExample,
  searchbar: SearchBarExample,
};

const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
const dataSource = ds.cloneWithRows(Object.keys(examples));

class ExampleList extends Component {
  static navigationOptions = {
    title: 'Examples',
  };

  static propTypes = {
    theme: PropTypes.object.isRequired,
    navigation: PropTypes.object,
  };

  _renderRow = id => {
    const { theme: { colors: { paper, text } } } = this.props;
    return (
      <TouchableRipple
        style={[styles.item, { backgroundColor: paper }]}
        onPress={() => this.props.navigation.navigate(id)}
      >
        <Text style={[styles.text, { color: text }]}>
          {examples[id].title}
        </Text>
      </TouchableRipple>
    );
  };

  _renderSeparator = (sectionId, rowId) => <Divider key={rowId} />;

  render() {
    const { theme: { colors: { background } } } = this.props;
    return (
      <View style={{ flex: 1, backgroundColor: background }}>
        <ListView
          dataSource={dataSource}
          renderRow={this._renderRow}
          renderSeparator={this._renderSeparator}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  item: {
    padding: 16,
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default withTheme(ExampleList);
