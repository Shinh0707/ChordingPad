# 動的コード進行生成インターフェース "Dynamic Harmony Grid" 仕様書

## 1. 概要
本アプリケーションは、GTTM（Generative Theory of Tonal Music）およびTPS（Tonal Pitch Space）の理論に基づき、ユーザーが直感的に「緊張と緩和（上下）」「調性的距離（左右）」を操作して演奏できるWebアプリケーションである。
音楽理論の知識がないユーザーでも、「上がり下がり」や「感情」の選択によって、音楽的に成立する、あるいは意図的な不協和を含むコード進行を生成・演奏することを目的とする。

## 2. 技術スタック
- **Framework:** React (Vite)
- **Language:** TypeScript (推奨)
- **Logic Library:** tonal (tonal.js)
- **Styling:** CSS Modules / Styled-components / MUI (任意)

## 3. 基本要件 (Core Features)

### 3.1 動的グリッドシステム
- **構成:** 縦3段 × 横N列（奇数推奨、初期値5または7）のグリッド状にコードボタンを配置する。
- **再計算 (Re-centering):** グリッド内の任意のコードボタンを押下すると、そのコードのルート音を新たな「中心（Center）」として、全グリッドのコードを再計算・再配置する。

### 3.2 軸の定義
- **縦軸（機能 / Function）**
    - **上段 (Up / Tension):** ドミナント方向（完全5度上）。緊張の高まり、解決への欲求。
    - **中段 (Same / Stability):** トニック方向（ルート維持）。安定、停滞。
    - **下段 (Down / Relaxation):** サブドミナント方向（完全4度上）。安らぎ、展開。

- **横軸（距離 / Distance）**
    - **中央 (Center):** 現在の調性中心（ダイアトニック）。
    - **内側 (Inner / ±1):** 近親調、モーダルインターチェンジ（同主短調など）。
    - **外側 (Outer / ±2以上):** 遠隔調、裏コード、不協和な関係。五度圏上の距離に基づく。

### 3.3 ユーザーコントロール
- **テンションスライダー (Complexity):** - 0〜3の4段階でコードの構成音（サフィックス）の複雑さを調整する。
- **感情ナビゲーション (Emotional Navigation):**
    - 現在のルートに対し、特定の感情的効果を持つ転調を直接行うボタン群。

---

## 4. ロジック詳細仕様 (Algorithm)

### 4.1 入力パラメータ
```typescript
interface GridParams {
  currentRoot: string;   // 現在の中心ルート音 (例: "C")
  gridWidth: number;     // 横幅 (例: 5)
  tensionLevel: 0 | 1 | 2 | 3; // テンション量
}

```

### 4.2 テンションレベル定義 (Suffix Map)

`tensionLevel` に応じて付与するコード・クオリティを決定する。

| Level | 意味 | Major系 (Tonic/Sub) | Dominant系 | Minor系 |
| --- | --- | --- | --- | --- |
| **0** | Triad (シンプル) | "" (Major) | "" (Major) | "m" |
| **1** | 7th (基本) | "M7" | "7" | "m7" |
| **2** | 9th (都会的) | "M9" | "9" | "m9" |
| **3** | Complex (高度) | "M13" / "69" | "7b9" (Alt) | "m11" |

### 4.3 グリッド生成ロジック

各セルの座標 `(row, col)` に対するコード生成ルール。`col` は中心を0とする相対インデックス（例: -2, -1, 0, 1, 2）。

1. **水平方向のルート決定 (Horizontal Root Shift):**
* `offset = col` とする。
* 五度圏上の移動距離 `interval = offset * 7` (半音単位)。
* **Inner/Outerの微調整:**
* `abs(col) == 1` の場合: 平行調や同主調を優先するため、五度圏移動に加え、マイナー/メジャーの質感を反転させるロジックを含める（オプション）。
* `abs(col) >= 2` の場合: 単純な五度圏移動、または裏コード（増4度）等を割り当てる。


* 結果として `targetBaseRoot` を取得。


2. **垂直方向の機能適用 (Vertical Function):**
* **Row = Up:** `Note.transpose(targetBaseRoot, "5P")` + Dominant Suffix
* **Row = Same:** `targetBaseRoot` + Major/Minor Suffix
* **Row = Down:** `Note.transpose(targetBaseRoot, "4P")` + Major Suffix



### 4.4 感情ナビゲーションボタン定義

ボタン押下時に `currentRoot` を強制的に変更するプリセット。

| ラベル | 理論的動作 (Interval) | ターゲット例 (from C) |
| --- | --- | --- |
| **明るくする** | `1P` -> `5P` (Dominant Key) | G Major |
| **落ち着く** | `1P` -> `4P` (Subdominant Key) | F Major |
| **切なくする** | `1P` -> `3m` (Relative Minor) | Eb Major (or Cm) |
| **不安になる** | `1P` -> `2m` or `5d` (Distant) | Db Major / Gb Major |

---

## 5. UI/UX デザイン仕様

### 5.1 レイアウト構成

```
[Header]
  - Current Chord Display (例: C Major 7)
  - Tension Slider [0 --|-- 3]

[Emotional Navigation Bar]
  [不安(Gb)] [切ない(Eb)] [戻る(C)] [明るい(G)] ...

[Chord Grid Area]
  -----------------------------
  | Up(-2) | Up(-1) | Up(0) | Up(1) | Up(2) |  <- Tension / Dominant
  -----------------------------
  | Same(-2)| Same(-1)| Center| Same(1)| Same(2)|  <- Stable / Tonic
  -----------------------------
  | Down(-2)| Down(-1)| Down(0)| Down(1)| Down(2)|  <- Relax / Subdominant
  -----------------------------

```

### 5.2 視覚フィードバック

* **Center Highlight:** グリッド中央のボタンは常に強調表示（ボーダー、発光など）。
* **Scale Safety:** 現在のスケールに含まれる構成音のみのコードは「安全色（青/緑系）」、ノンダイアトニックを含むコードは「警戒色（紫/オレンジ系）」で背景色を区別する。
* **Interaction:** タップ/クリック時に即座に音声を再生し、UIのアニメーション（リップルエフェクト等）を伴って再配置を行う。

## 6. データ構造例 (TypeScript)

```typescript
type ChordFunction = 'Tension' | 'Stability' | 'Relaxation';
type DistanceType = 'Center' | 'Inner' | 'Outer';

interface ChordCell {
  id: string;          // 一意のキー (例: "C-Up-0")
  root: string;        // 音名 (例: "G")
  suffix: string;      // コード質 (例: "7")
  fullName: string;    // 表示名 (例: "G7")
  intervals: string[]; // 構成音 (例: ["G", "B", "D", "F"])
  
  // UI制御用メタデータ
  verticalFunction: ChordFunction;
  distanceType: DistanceType;
  isInKey: boolean;    // 現在のキーに含まれるか
}

interface GridState {
  up: ChordCell[];
  same: ChordCell[];
  down: ChordCell[];
}

```

## 7. 今後の拡張性 (Optional)

* **MIDI出力:** Web MIDI APIを使用し、DAWへMIDIノートを送信する機能。
* **インバージョン (転回形):** ベース音の流れをスムーズにするため、ボイシングを自動最適化する機能。
* **リズムパターン:** コードを押している間、アルペジオやバッキングパターンをループ再生する機能。