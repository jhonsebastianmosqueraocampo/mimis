import {
    DimensionValue,
    ImageStyle,
    StyleProp,
    TextStyle,
    ViewStyle,
} from "react-native";

type RNStyle = ViewStyle | TextStyle | ImageStyle;

type Sx = {
  // spacing
  p?: number;
  px?: number;
  pb?: number;
  py?: number;
  pt?: number;

  m?: number;
  mt?: number;
  mb?: number;
  mx?: number;
  ml?: number;
  mr?: number;

  // layout
  flex?: number;
  row?: boolean;
  center?: boolean;

  // size
  w?: DimensionValue;
  h?: DimensionValue;

  // colors
  bg?: string;
  color?: string;

  // border
  r?: number;

  // border
  bw?: number;
  bc?: string;

  // align
  items?: ViewStyle["alignItems"];
  justify?: ViewStyle["justifyContent"];
};

export function sx<T extends RNStyle = ViewStyle>(s: Sx): StyleProp<T> {
  const out: any = {};

  if (s.p !== undefined) out.padding = s.p;
  if (s.pt !== undefined) out.padding = s.pt;

  if (s.px !== undefined) {
    out.paddingLeft = s.px;
    out.paddingRight = s.px;
  }

  if (s.py !== undefined) {
    out.paddingTop = s.py;
    out.paddingBottom = s.py;
  }

  if (s.m !== undefined) out.margin = s.m;
  if (s.mt !== undefined) out.marginTop = s.mt;
  if (s.mb !== undefined) out.marginBottom = s.mb;
  if (s.ml !== undefined) out.marginLeft = s.ml;
  if (s.mr !== undefined) out.marginRight = s.mr;
  if (s.mx !== undefined) {
    out.marginLeft = s.mx;
    out.marginRight = s.mx;
  }

  if (s.flex !== undefined) out.flex = s.flex;

  if (s.row) out.flexDirection = "row";

  if (s.center) {
    out.alignItems = "center";
    out.justifyContent = "center";
  }

  if (s.w !== undefined) out.width = s.w;
  if (s.h !== undefined) out.height = s.h;

  if (s.bg) out.backgroundColor = s.bg;

  if (s.color) out.color = s.color;

  if (s.r !== undefined) out.borderRadius = s.r;
  if (s.bw !== undefined) out.borderWidth = s.bw;
  if (s.bc) out.borderColor = s.bc;

  if (s.items) out.alignItems = s.items;
  if (s.justify) out.justifyContent = s.justify;

  return out;
}
