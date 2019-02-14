
import React from 'react';
import {
  View,
  Text,
  Modal,
  Dimensions,

  StyleSheet,
  TouchableOpacity,
  Platform
} from 'react-native';
import PropTypes from 'prop-types';
import BaseComponent from './BaseComponent';
import webRegionAPI from './webRegionAPI';
import Picker from './Wheel/Wheel'
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const isIos = Platform.OS === 'ios';

export default class ChinaRegionWheelPicker extends BaseComponent {

  constructor(props) {
    super(props);
    this._bind(
      'open',
      'close',
      '_handleProvinceChange',
      '_handleCityChange',
      '_handleAreaChange',
      '_handleSubmit',
      '_handleCancel',
    );
    this.state = {
      isVisible: this.props.isVisible,
      provinces: [],
      citys: [],
      areas: [],
      selectedProvince: {
        name: this.props.selectedProvince
      },
        selectedProvinceIndex: 0,
      selectedCity: {
        name: this.props.selectedCity
      },
        selectedCityIndex: 0,
      selectedArea: {
        name: this.props.selectedArea
      },
        selectedAreaIndex: 0,
      transparent: true,
    };
  }
  _filterAllProvinces() {
    return this._regionAllData
  }
  _filterCitys(province) {
    const provinceData = this._regionAllData.find(item => item.name === province.name);
    return provinceData.city;
  }
  _filterAreas(province, city) {
    const provinceData = this._regionAllData.find(item => item.name === province.name);
    const cityData = provinceData.city.find(item => item.name === city.name);
    return cityData.area;
  }

  componentDidMount() {
    webRegionAPI().then((area) => {
      // console.log('area', area);
      this._regionAllData = area;

      const provinces = this._filterAllProvinces();
      // console.log('provinces', provinces);

      const citys = this._filterCitys(this.state.selectedProvince);

      const areas = this._filterAreas(this.state.selectedProvince, this.state.selectedCity);

      let selectedProvince = provinces.find(item => item.name === this.props.selectedProvince);
      let selectedCity = citys.find(item => item.name === this.props.selectedCity);
      let selectedArea = areas.find(item => item.name === this.props.selectedArea);
      this.setState({
        provinces,
        citys,
        areas,
        selectedProvince,
        selectedCity,
        selectedArea
      });
    });
  }
  componentWillReceiveProps(props) {
    if (props.isVisible !== this.props.isVisible) {
      if (props.isVisible) {
        this.open();
      } else {
        this.close();
      }
    }
  }

  close() {
    this.setState({ isVisible: false });
  }
  open() {
    console.log('openopen');
    this.setState({ isVisible: true });
  }

  _handleProvinceChange(province_index) {
    let province = this._regionAllData[province_index];
    const citys = this._filterCitys(province);
    const areas = this._filterAreas(province, citys[0]);

    this.setState({
      selectedProvince: province,
      selectedCity: citys[0],
      selectedArea: areas[0],
        selectedProvinceIndex: province_index,
        selectedCityIndex: 0,
        selectedAreaIndex: 0,
      citys,
      areas
    });
  }
  _handleCityChange(city_index) {
    let city = this.state.citys[city_index];
    const areas = this._filterAreas(this.state.selectedProvince, city);
    this.setState({
      selectedCity: city,
      selectedArea: areas[0],
        selectedCityIndex: city_index,
        selectedAreaIndex: 0,
      areas
    });
  }
  _handleAreaChange(area_index) {
    this.setState({
        selectedArea: this.state.areas[area_index],
        selectedAreaIndex: area_index,
    })

    // this.setState({
    //   selectedArea: area,
    // });
  }

  _handleCancel() {
    if (this.props.onCancel) {
      this.props.onCancel();
    }
    this.close();
  }
  _handleSubmit() {
    if (this.props.onSubmit) {
      this.props.onSubmit({
          province: this.state.provinces[this.state.selectedProvinceIndex],
          city: this.state.citys[this.state.selectedCityIndex],
          area: this.state.areas[this.state.selectedAreaIndex]
      });
    }
    this.close();
  }

  renderPicker() {
    const { navBtnColor } = this.props;
    return (
      <View style={styles.overlayStyle}>
        <View style={[styles.pickerContainer, isIos ? {} : { marginTop: windowHeight - 80 - this.props.androidPickerHeight }]}>
          <View style={styles.navWrap}>
            <TouchableOpacity
              style={[styles.navBtn, { borderColor: navBtnColor }]}
              activeOpacity={0.85}
              onPress={this._handleCancel}
            >
              <Text style={[styles.text, { color: navBtnColor }]}>取消</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.navBtn, { backgroundColor: navBtnColor, borderColor: navBtnColor }]}
              activeOpacity={0.85}
              onPress={this._handleSubmit}
            >
              <Text style={[styles.text, { color: 'white' }]}>确认</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.pickerWrap}>

            <Picker
                items={this.state.provinces}
                style={[styles.pickerItem, {height: this.props.androidPickerHeight}]}
                index={this.state.selectedProvinceIndex}
                itemStyle={{textAlign: 'center'}}
              onChange={this._handleProvinceChange}
              // onValueChange={this._handleProvinceChange}
              // selectedValue={this.state.selectedProvince}
            >
              {this.state.provinces.map((province, index) => {
                return (
                  <Picker.Item value={province} label={province.name} key={index} />
                );
              })}
            </Picker>

            <Picker
                index={this.state.selectedCityIndex}
                items={this.state.citys}
                style={[styles.pickerItem, {height: this.props.androidPickerHeight}]}
                itemStyle={{textAlign: 'center'}}
              onChange={this._handleCityChange}
              // onValueChange={this._handleCityChange}
              // selectedValue={this.state.selectedCity}
            >
              {this.state.citys.map((city, index) => {
                return (
                  <Picker.Item value={city} label={city.name} key={index} />
                );
              })}
            </Picker>

            {
              this.props.isShowArea &&

              <Picker
                  index={this.state.selectedAreaIndex}
                items={this.state.areas}
                  style={[styles.pickerItem, {height: this.props.androidPickerHeight}]}
                  itemStyle={{textAlign: 'center'}}
                // onValueChange={this._handleAreaChange}
                // selectedValue={this.state.selectedArea}
                onChange={this._handleAreaChange}
              >
                {this.state.areas.map((area, index) => {
                  return (
                    <Picker.Item value={area} label={area.name} key={index} />
                  );
                })}
              </Picker>
            }

          </View>
        </View>
      </View>
    );
  }

  render() {
    const modal = (
      <Modal
        transparent={this.state.transparent}
        visible={this.state.isVisible}
        onRequestClose={this.close}
        animationType={this.props.animationType}
      >
        {this.renderPicker()}
      </Modal>
    );

    return (
      <View>
        {modal}
        <TouchableOpacity onPress={this.open}>
          {this.props.children}
        </TouchableOpacity>
      </View>
    );
  }
}
ChinaRegionWheelPicker.propTypes = {
  isVisible: PropTypes.bool,
  isShowArea: PropTypes.bool,
  selectedProvince: PropTypes.string,
  selectedCity: PropTypes.string,
  selectedArea: PropTypes.string,
  navBtnColor: PropTypes.string,
  animationType: PropTypes.string,
  transparent: PropTypes.bool,
  onSubmit: PropTypes.func,
  onCancel: PropTypes.func,
  androidPickerHeight: PropTypes.number,
};

ChinaRegionWheelPicker.defaultProps = {
  isVisible: false,
  isShowArea: true,
    selectedProvince: '北京市',
  selectedCity: '北京市',
  selectedArea: '东城区',
  navBtnColor: 'blue',
  animationType: 'slide',
  transparent: true,
  onSubmit: () => {},
  onCancel: () => {},
  androidPickerHeight: 250
};

const styles = StyleSheet.create({
  overlayStyle: {
    flex: 1,
    width: windowWidth,
    height: windowHeight,
    left: 0,
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  pickerContainer: {
    flex: 1,
    marginTop: windowHeight * 3 / 5,
    backgroundColor: '#FFF'
  },
  navWrap: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderColor: '#ccc'
  },
  navBtn: {
    paddingVertical: 5,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderRadius: 4
  },
  text: {
    fontSize: 18,
  },
  pickerWrap: {
    flexDirection: 'row'
  },
  pickerItem: {
    flex: 1,
      height: 200
  }
});
