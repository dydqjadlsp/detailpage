/**
 * 피그마 플러그인 통신 및 커맨드 타입 정의
 * 통신 레이어를 추상화하여 Supabase Realtime / WebSocket 전환 가능
 */

// ===== 통신 추상화 =====

export type TransportType = 'supabase' | 'websocket';

export interface TransportConfig {
  type: TransportType;
  supabase?: {
    url: string;
    anonKey: string;
  };
  websocket?: {
    host: string;
    port: number;
  };
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface TransportEvents {
  onStatusChange: (status: ConnectionStatus) => void;
  onCommandResult: (id: string, result: FigmaCommandResult) => void;
  onProgress: (progress: ProgressUpdate) => void;
  onError: (error: string) => void;
}

export interface FigmaTransport {
  connect(channel: string, events: TransportEvents): Promise<void>;
  sendCommand(command: FigmaCommand, timeoutMs?: number): Promise<FigmaCommandResult>;
  disconnect(): void;
  getStatus(): ConnectionStatus;
}

// ===== 피그마 커맨드 =====

export type FigmaCommandType =
  | 'get_document_info'
  | 'get_selection'
  | 'get_node_info'
  | 'get_nodes_info'
  | 'create_rectangle'
  | 'create_frame'
  | 'create_text'
  | 'create_ellipse'
  | 'create_group'
  | 'create_component_instance'
  | 'set_fill_color'
  | 'set_image_fill'
  | 'set_gradient_fill'
  | 'set_multiple_fills'
  | 'set_stroke_color'
  | 'set_effects'
  | 'set_opacity'
  | 'set_blend_mode'
  | 'set_layout_mode'
  | 'set_padding'
  | 'set_axis_align'
  | 'set_layout_sizing'
  | 'set_item_spacing'
  | 'set_text_content'
  | 'set_multiple_text_contents'
  | 'set_text_style'
  | 'set_range_text_style'
  | 'set_corner_radius'
  | 'set_rotation'
  | 'move_node'
  | 'resize_node'
  | 'set_auto_resize'
  | 'delete_node'
  | 'delete_multiple_nodes'
  | 'clone_node'
  | 'set_instance_overrides'
  | 'export_node_as_image'
  | 'set_focus'
  | 'set_selections'
  | 'scan_text_nodes'
  | 'scan_nodes_by_types'
  | 'create_tree'
  | 'execute_code';

export interface FigmaCommand {
  id: string;
  command: FigmaCommandType;
  params: Record<string, unknown>;
  group?: string;
  description?: string;
}

export interface FigmaCommandResult {
  id: string;
  result?: Record<string, unknown> & { id?: string };
  error?: string;
}

// ===== 색상 =====

export interface RGBAColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

// ===== 커맨드 파라미터 =====

export interface CreateFrameParams {
  x?: number;
  y?: number;
  width: number;
  height: number;
  name?: string;
  parentId?: string;
  fillColor?: RGBAColor;
  strokeColor?: RGBAColor;
  strokeWeight?: number;
  layoutMode?: 'NONE' | 'VERTICAL' | 'HORIZONTAL';
  layoutWrap?: 'NO_WRAP' | 'WRAP';
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  primaryAxisAlignItems?: 'MIN' | 'MAX' | 'CENTER' | 'SPACE_BETWEEN';
  counterAxisAlignItems?: 'MIN' | 'MAX' | 'CENTER' | 'BASELINE';
  layoutSizingHorizontal?: 'FIXED' | 'HUG' | 'FILL';
  layoutSizingVertical?: 'FIXED' | 'HUG' | 'FILL';
  itemSpacing?: number;
}

export interface CreateTextParams {
  x?: number;
  y?: number;
  text: string;
  fontSize?: number;
  fontWeight?: number;
  fontColor?: RGBAColor;
  fontFamily?: string;
  name?: string;
  parentId?: string;
}

export interface CreateRectangleParams {
  x?: number;
  y?: number;
  width: number;
  height: number;
  name?: string;
  parentId?: string;
}

export interface SetImageFillParams {
  nodeId: string;
  imageUrl?: string;
  imageBase64?: string;
  scaleMode?: 'FILL' | 'FIT' | 'TILE' | 'STRETCH';
}

export interface SetFillColorParams {
  nodeId: string;
  color: RGBAColor;
}

export interface SetCornerRadiusParams {
  nodeId: string;
  radius: number;
  corners?: boolean[];
}

export interface SetLayoutModeParams {
  nodeId: string;
  layoutMode: 'NONE' | 'VERTICAL' | 'HORIZONTAL';
  layoutWrap?: 'NO_WRAP' | 'WRAP';
}

export interface SetPaddingParams {
  nodeId: string;
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;
}

export interface SetItemSpacingParams {
  nodeId: string;
  itemSpacing?: number;
  counterAxisSpacing?: number;
}

export interface SetTextStyleParams {
  nodeId: string;
  fontSize?: number;
  fontWeight?: number;
  fontFamily?: string;
}

export interface ResizeNodeParams {
  nodeId: string;
  width: number;
  height: number;
}

export interface MoveNodeParams {
  nodeId: string;
  x: number;
  y: number;
}

// ===== 진행률 =====

export interface ProgressUpdate {
  step: string;
  progress: number;
  detail?: string;
  totalCommands?: number;
  completedCommands?: number;
}

// ===== 생성 요청/응답 =====

export type GenerateMode = 'detail-page' | 'web-design' | 'reference-clone';

export type GenerateOutputFormat = 'flat-commands' | 'tree' | 'hybrid';

export interface FigmaGenerateRequest {
  mode: GenerateMode;
  category?: string;
  inputData?: Record<string, unknown>;
  style?: {
    colorScheme?: string;
    fontStyle?: string;
    layout?: string;
  };
  pixelHeight?: string;
  canvasWidth?: number;
  outputFormat?: GenerateOutputFormat;
}

export interface FigmaGenerateResponse {
  commands: FigmaCommand[];
  tree?: TreeNode;
  postProcessCode?: string;
  metadata: {
    totalCommands: number;
    sections: string[];
    estimatedTime: string;
    outputFormat?: GenerateOutputFormat;
    model?: string;
  };
  images?: Array<{
    sectionType: string;
    imageUrl: string;
  }>;
}

// ===== 레퍼런스 복제 =====

export interface ScannedTextNode {
  id: string;
  name: string;
  characters: string;
  fontSize: number;
  fontFamily: string;
  fontStyle: string;
  x: number;
  y: number;
  width: number;
  height: number;
  path: string;
  depth: number;
}

export interface ScannedImageNode {
  id: string;
  name: string;
  type: string;
  bbox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface TextReplacement {
  nodeId: string;
  text: string;
}

// ===== 레퍼런스 분석 =====

export interface SectionElement {
  type: 'heading' | 'subheading' | 'body-text' | 'caption' | 'image' | 'button' | 'card' | 'icon' | 'divider' | 'badge' | 'form-input' | 'list-item';
  x: number;
  y: number;
  width: number;
  height: number;
  text?: string;
  fontSize?: number;
  fontWeight?: number;
  fontFamily?: string;
  letterSpacing?: number;
  lineHeight?: number;
  textAlign?: 'LEFT' | 'CENTER' | 'RIGHT';
  textColor?: string;
  backgroundColor?: string;
  gradient?: GradientDef;
  borderRadius?: number;
  border?: { color: string; width: number };
  shadow?: { x: number; y: number; blur: number; spread: number; color: string };
  opacity?: number;
  imageDescription?: string;
}

export interface GradientDef {
  type: 'linear' | 'radial' | 'angular';
  colors: Array<{ color: string; position: number }>;
  angle?: number;
}

export interface DetailedSection {
  type: string;
  layout: string;
  hasImage: boolean;
  hasText: boolean;
  estimatedHeight: number;
  backgroundColor?: string;
  backgroundGradient?: GradientDef;
  padding?: { top: number; right: number; bottom: number; left: number };
  gap?: number;
  contentWidth?: number;
  contentAlign?: 'left' | 'center' | 'right';
  elements: SectionElement[];
}

export interface ReferenceAnalysis {
  analysisId: string;
  screenshot?: string;
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    additionalColors?: string[];
  };
  sections: DetailedSection[];
  typography: {
    headingStyle: string;
    bodyStyle: string;
    headingSize: number;
    bodySize: number;
    headingFont?: string;
    bodyFont?: string;
    headingWeight?: number;
    bodyWeight?: number;
    headingLetterSpacing?: number;
    bodyLineHeight?: number;
  };
  overallStyle: string;
  totalHeight: number;
  spacing?: {
    sectionGap: number;
    contentMaxWidth: number;
    defaultPadding: { top: number; right: number; bottom: number; left: number };
  };
  effects?: {
    gradients: Array<GradientDef & { usage: string }>;
    shadows: Array<{ x: number; y: number; blur: number; spread: number; color: string; usage: string }>;
    hasGlassEffect: boolean;
    hasParallax: boolean;
  };
}

// ===== 트리 기반 생성 (FigGen 패턴) =====

export type TreeNodeType = 'FRAME' | 'TEXT' | 'RECTANGLE' | 'ELLIPSE' | 'GROUP';

export interface TreeNodeFill {
  type: 'SOLID' | 'GRADIENT_LINEAR' | 'GRADIENT_RADIAL';
  color?: RGBAColor;
  gradientStops?: Array<{ color: RGBAColor; position: number }>;
  gradientTransform?: number[][];
  opacity?: number;
}

export interface TreeNodeEffect {
  type: 'DROP_SHADOW' | 'INNER_SHADOW' | 'LAYER_BLUR' | 'BACKGROUND_BLUR';
  color?: RGBAColor;
  offset?: { x: number; y: number };
  radius?: number;
  spread?: number;
  visible?: boolean;
}

export interface TreeNode {
  type: TreeNodeType;
  name?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;

  // Auto Layout (FRAME)
  layoutMode?: 'NONE' | 'VERTICAL' | 'HORIZONTAL';
  layoutWrap?: 'NO_WRAP' | 'WRAP';
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  primaryAxisAlignItems?: 'MIN' | 'MAX' | 'CENTER' | 'SPACE_BETWEEN';
  counterAxisAlignItems?: 'MIN' | 'MAX' | 'CENTER' | 'BASELINE';
  layoutSizingHorizontal?: 'FIXED' | 'HUG' | 'FILL';
  layoutSizingVertical?: 'FIXED' | 'HUG' | 'FILL';
  itemSpacing?: number;

  // 스타일
  fillColor?: RGBAColor;
  fills?: TreeNodeFill[];
  strokeColor?: RGBAColor;
  strokeWeight?: number;
  cornerRadius?: number;
  corners?: [number, number, number, number];
  opacity?: number;
  effects?: TreeNodeEffect[];
  blendMode?: 'NORMAL' | 'MULTIPLY' | 'SCREEN' | 'OVERLAY' | 'SOFT_LIGHT' | 'COLOR_DODGE';
  rotation?: number;

  // TEXT 전용
  text?: string;
  fontSize?: number;
  fontWeight?: number;
  fontFamily?: string;
  fontColor?: RGBAColor;
  textAlignHorizontal?: 'LEFT' | 'CENTER' | 'RIGHT' | 'JUSTIFIED';
  letterSpacing?: number;
  lineHeight?: number;
  textAutoResize?: 'NONE' | 'WIDTH_AND_HEIGHT' | 'HEIGHT' | 'TRUNCATE';
  rangeStyles?: Array<{
    start: number; end: number;
    fontSize?: number; fontWeight?: number;
    fontColor?: RGBAColor; fontFamily?: string;
    textDecoration?: 'NONE' | 'UNDERLINE' | 'STRIKETHROUGH';
    letterSpacing?: number;
  }>;

  // 재귀 자식
  children?: TreeNode[];

  // 후처리 참조용 태그
  tag?: string;
}

export interface CreateTreeResult {
  rootId: string;
  nodeMap: Record<string, string>;
  totalCreated: number;
}

export interface ExecuteCodeParams {
  code: string;
  timeout?: number;
}

export interface ExecuteCodeResult {
  result: unknown;
  logs: string[];
  executionTime: number;
}

// ===== 확장 입력 데이터 (상세페이지 품질 강화) =====

/** 톤&매너 선택지 */
export type ToneManner =
  | 'premium'      // 고급/럭셔리
  | 'trendy'       // 트렌디/모던
  | 'cute'         // 귀여운/캐주얼
  | 'clean'        // 깔끔/미니멀
  | 'warm'         // 따뜻한/감성
  | 'professional' // 전문적/신뢰
  | 'bold'         // 강렬/임팩트
  | 'natural';     // 자연적/친환경

/** 강화된 입력 데이터에서 타입 안전하게 필드를 추출하는 헬퍼 */
export function extractInputField(inputData: Record<string, unknown> | undefined, key: string): string {
  if (!inputData) return '';
  const val = inputData[key];
  if (typeof val === 'string') return val;
  if (Array.isArray(val)) return val.join(', ');
  return '';
}

/** 배열 필드 추출 헬퍼 */
export function extractInputArray(inputData: Record<string, unknown> | undefined, key: string): string[] {
  if (!inputData) return [];
  const val = inputData[key];
  if (Array.isArray(val)) return val.map(String);
  if (typeof val === 'string' && val.trim()) return val.split(',').map(s => s.trim());
  return [];
}

// ===== 피그마 파일 파싱 결과 =====

/** Figma REST API에서 추출한 노드 스타일 */
export interface FigmaNodeStyle {
  fills: Array<{
    type: string;
    color?: RGBAColor;
    opacity?: number;
    gradientStops?: Array<{ color: RGBAColor; position: number }>;
  }>;
  strokes: Array<{ type: string; color?: RGBAColor }>;
  strokeWeight?: number;
  effects: Array<{
    type: string;
    color?: RGBAColor;
    offset?: { x: number; y: number };
    radius?: number;
    spread?: number;
    visible?: boolean;
  }>;
  cornerRadius?: number;
  opacity?: number;
}

/** Figma REST API 파싱으로 추출한 텍스트 스타일 */
export interface FigmaTextStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  lineHeight?: number;
  letterSpacing?: number;
  textAlignHorizontal?: string;
  fills?: Array<{ type: string; color?: RGBAColor }>;
}

/** Figma REST API 파싱 결과 (파일 전체) */
export interface FigmaFileAnalysis {
  fileKey: string;
  fileName: string;
  /** 추출된 색상 팔레트 (사용 빈도 기준 정렬) */
  colorPalette: Array<{
    color: string; // hex
    rgba: RGBAColor;
    count: number; // 사용 횟수
    usage: 'fill' | 'text' | 'stroke';
  }>;
  /** 사용된 텍스트 스타일 (빈도 기준 정렬) */
  textStyles: Array<FigmaTextStyle & { count: number }>;
  /** 프레임 구조 (최상위 섹션들) */
  sections: Array<{
    name: string;
    type: string;
    width: number;
    height: number;
    layoutMode?: string;
    padding?: { top: number; right: number; bottom: number; left: number };
    gap?: number;
    backgroundColor?: string;
    childCount: number;
    hasImage: boolean;
    hasOverlay: boolean;
    effects: string[]; // ['DROP_SHADOW', 'GRADIENT_LINEAR'] 등
  }>;
  /** 전체 통계 */
  stats: {
    totalNodes: number;
    totalTexts: number;
    totalImages: number;
    totalFrames: number;
    canvasWidth: number;
    canvasHeight: number;
  };
}

// ===== 클론 루프 시스템 =====

/** REST API에서 가져온 원본 노드 (full depth) */
export interface FigmaRestNode {
  id: string;
  name: string;
  type: string;
  children?: FigmaRestNode[];
  fills?: Array<{
    type: string;
    color?: { r: number; g: number; b: number; a: number };
    opacity?: number;
    visible?: boolean;
    blendMode?: string;
    gradientStops?: Array<{ color: { r: number; g: number; b: number; a: number }; position: number }>;
    gradientHandlePositions?: Array<{ x: number; y: number }>;
    imageRef?: string;
    scaleMode?: string;
  }>;
  strokes?: Array<{ type: string; color?: { r: number; g: number; b: number; a: number } }>;
  strokeWeight?: number;
  effects?: Array<{
    type: string;
    visible?: boolean;
    color?: { r: number; g: number; b: number; a: number };
    offset?: { x: number; y: number };
    radius?: number;
    spread?: number;
  }>;
  cornerRadius?: number;
  rectangleCornerRadii?: [number, number, number, number];
  opacity?: number;
  blendMode?: string;
  rotation?: number;
  layoutMode?: string;
  layoutWrap?: string;
  primaryAxisAlignItems?: string;
  counterAxisAlignItems?: string;
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  itemSpacing?: number;
  counterAxisSpacing?: number;
  layoutSizingHorizontal?: string;
  layoutSizingVertical?: string;
  absoluteBoundingBox?: { x: number; y: number; width: number; height: number };
  size?: { x: number; y: number };
  characters?: string;
  style?: {
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: number;
    lineHeightPx?: number;
    letterSpacing?: number;
    textAlignHorizontal?: string;
    textAlignVertical?: string;
    textAutoResize?: string;
  };
  characterStyleOverrides?: number[];
  styleOverrideTable?: Record<string, {
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: number;
    fills?: Array<{ type: string; color?: { r: number; g: number; b: number; a: number } }>;
    letterSpacing?: number;
    textDecoration?: string;
  }>;
}

/** 클론 점수 결과 */
export interface CloneScore {
  total: number;
  structure: number;
  typography: number;
  color: number;
  dimension: number;
  spacing: number;
  details: CloneScoreDetail[];
}

export interface CloneScoreDetail {
  category: string;
  field: string;
  expected: string;
  actual: string;
  score: number;
  severity: 'critical' | 'major' | 'minor';
}

/** 클론 루프 설정 */
export interface CloneConfig {
  fileKey: string;
  token: string;
  pageId: string;
  sectionIds: string[];
  targetScore: number;
  maxAttempts: number;
  channelName: string;
  offsetXStep: number;
}

/** 클론 루프 진행 상태 */
export interface CloneProgress {
  phase: 'extracting' | 'converting' | 'creating' | 'scanning' | 'scoring' | 'patching' | 'moving' | 'complete' | 'failed';
  attempt: number;
  maxAttempts: number;
  sectionIndex: number;
  sectionName: string;
  score?: CloneScore;
  message: string;
}

// ===== 2단계 분석 (Codia 패턴) =====

export interface GlobalStructure {
  totalHeight: number;
  canvasWidth: number;
  sectionCount: number;
  sections: Array<{
    type: string;
    estimatedHeight: number;
    backgroundColor?: string;
    layout: string;
  }>;
  colorPalette: ReferenceAnalysis['colorPalette'];
  typography: ReferenceAnalysis['typography'];
  overallStyle: string;
}
