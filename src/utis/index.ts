import { PixelRatio, Dimensions, Platform, NativeModules } from 'react-native';
import { Toast } from 'teaset';

export let screenW = Dimensions.get('window').width;
export let screenH = Dimensions.get('window').height;
const fontScale = PixelRatio.getFontScale();
//px转换成dp
//以iphone6为基准,如果以其他尺寸为基准的话,请修改下面的defaultWidth和defaultHeight为对应尺寸即可. 以下为1倍图时
const defaultWidth = 375;
const defaultHeight = 667;

//缩放比例
const _scaleWidth = screenW / defaultWidth;
const _scaleHeight = screenH / defaultHeight;
interface ImageInfo {
  width: number;
  height: number;
}
/* 工具类 */
class Utils {
  constructor() { }
  // 是不是iphoneX手机
  public isIphoneX() {
    return (
      Platform.OS === 'ios' &&
      ((screenW === 375 && screenH === 812) ||
        (screenW === 812 && screenH === 375))
    );
  }

  /* 屏幕尺寸宽度*/
  public screenW(): number {
    return screenW;
  }
  /* 屏幕尺寸高度*/
  public screenH(): number {
    return screenH;
  }
  /**
   * 屏幕适配,缩放size , 默认根据宽度适配，纵向也可以使用此方法
   * 横向的尺寸直接使用此方法
   * 如：width ,paddingHorizontal ,paddingLeft ,paddingRight ,marginHorizontal ,marginLeft ,marginRight
   * @param size 设计图的尺寸
   * @returns {number}
   */
  public scaleSize(size: number): number {
    return size * _scaleWidth;
  }
  /**
   * 屏幕适配 , 纵向的尺寸使用此方法应该会更趋近于设计稿
   * 如：height ,paddingVertical ,paddingTop ,paddingBottom ,marginVertical ,marginTop ,marginBottom
   * @param size 设计图的尺寸
   * @returns {number}
   */
  public scaleHeight(size: number): number {
    return size * _scaleHeight;
  }
  /**
   * 设置字体的size（单位px）
   * @param size 传入设计稿上的px , allowFontScaling 是否根据设备文字缩放比例调整，默认不会
   * @returns {Number} 返回实际sp
   */
  public setSpText(size: number, allowFontScaling: boolean = false): number {
    const scale = Math.min(_scaleWidth, _scaleHeight);
    const fontSize = allowFontScaling ? 1 : fontScale;
    return (size * scale) / fontSize;
  }

  /**
   * 时间戳转时间格式
   * @param dayStyle 日期间隔的样式需要默认是横杆（-）
   * @param dayConTimeStyle 日期间隔的样式需要默认是空格（' '）
   * @param timeStyle 日期间隔的样式需要默认是冒号（:）
   * @param timeStyle 日期间隔的样式需要默认是冒号（:）
   * @returns {time:'2020-01-01 10:20:00'}
   */
  // 获取当前时间格式 （time:'2020-01-01 10:20:00',timeStamp:时间戳）
  public getTimeStyle({
    dayStyle = '-',
    dayConTimeStyle = ' ',
    timeStyle = ':',
    timeStamp = 0,
  }): { time: string } {
    const nowDate = timeStamp ? new Date(timeStamp) : new Date();
    const Y = nowDate.getFullYear();
    const M =
      nowDate.getMonth() + 1 < 10
        ? `0${nowDate.getMonth() + 1}`
        : nowDate.getMonth() + 1;
    const D =
      nowDate.getDate() < 10 ? `0${nowDate.getDate()}` : nowDate.getDate();
    const HH =
      nowDate.getHours() < 10 ? `0${nowDate.getHours()}` : nowDate.getHours();
    const MM =
      nowDate.getMinutes() < 10
        ? `0${nowDate.getMinutes()}`
        : nowDate.getMinutes();
    const SS =
      nowDate.getSeconds() < 10
        ? `0${nowDate.getSeconds()}`
        : nowDate.getSeconds();
    return {
      time: `${Y}${dayStyle}${M}${dayStyle}${D}${dayConTimeStyle}${HH}${timeStyle}${MM}${timeStyle}${SS}`,
    };
  }

  public getUuid(): string {
    const s = [];
    const hexDigits = '0123456789abcdef';
    for (let i = 0; i < 36; i++) {
      s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = '4'; // bits 12-15 of the time_hi_and_version field to 0010
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    s[19] = hexDigits.substr(((s[19] as any) & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
    s[8] = s[13] = s[18] = s[23] = '-';

    const uuid = s.join('');
    return uuid;
  }
  // 图片的缩放比
  public imageAutoSize(
    maxWidth: number,
    maxHeight: number,
    imgWidth: number,
    imgHeight: number,
  ): ImageInfo {
    const imgInfo = {
      width: 0,
      height: 0,
    };
    // 当图片比图片框小时不做任何改变
    if (imgWidth < maxWidth && imgHeight < maxHeight) {
      imgInfo.width = imgWidth;
      imgInfo.height = imgHeight;
    }
    //原图片宽高比例 大于 图片框宽高比例,则以框的宽为标准缩放，反之以框的高为标准缩放
    else {
      //原图片宽高比例 大于 图片框宽高比例
      if (maxWidth / maxHeight <= imgWidth / imgHeight) {
        imgInfo.width = maxWidth; //以框的宽度为标准
        imgInfo.height = maxWidth * (imgHeight / imgWidth);
      }
      //原图片宽高比例 小于 图片框宽高比例
      else {
        imgInfo.width = maxHeight * (imgWidth / imgHeight);
        imgInfo.height = maxHeight; //以框的高度为标准
      }
    }

    return imgInfo;
  }
  // 阿里云图片缩放
  public aliImageZoom(url: string, quality: number = 0): string {
    if (!url?.startsWith('http')) {
      return url;
    }
    if (quality) {
      url + `quality,q_${quality}`;
    }
    return url;
  }
  //定义一个公共Toast函数
  showToast(message: string) {
    console.log(NativeModules.CustomerModule);
    Platform.OS === 'android'
      ? NativeModules.CustomerModule.show(message)
      : Toast.info(message);
  }
}

export default new Utils();
