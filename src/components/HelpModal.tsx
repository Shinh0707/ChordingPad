import styled from '@emotion/styled';
import { useEffect } from 'react';

interface HelpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const Modal = styled.div`
  background-color: #1e1e1e;
  padding: 32px;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  color: #e0e0e0;
`;

const Title = styled.h2`
  margin: 0 0 24px 0;
  color: #fff;
  font-size: 1.8rem;
  border-bottom: 2px solid #333;
  padding-bottom: 12px;
`;

const Section = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.h3`
  color: #4ECDC4;
  margin: 0 0 12px 0;
  font-size: 1.2rem;
`;

const Text = styled.p`
  line-height: 1.6;
  margin: 0 0 12px 0;
  color: #ccc;
`;

const List = styled.ul`
  padding-left: 20px;
  margin: 0;
  li {
    margin-bottom: 8px;
    line-height: 1.5;
    color: #ccc;
  }
`;

const CloseButton = styled.button`
  background-color: #333;
  color: #fff;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  width: 100%;
  margin-top: 20px;
  transition: background-color 0.2s;
  font-weight: bold;

  &:hover {
    background-color: #444;
  }
`;

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleEsc);
        }
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <Overlay onClick={onClose}>
            <Modal onClick={e => e.stopPropagation()}>
                <Title>ChordingPadについて</Title>

                <Section>
                    <SectionTitle>これを使うと何ができる・嬉しいか</SectionTitle>
                    <Text>
                        音楽理論に詳しくない方でも、直感的にコード進行を演奏して楽しむことができるツールです。
                        ボタンを押すだけで、心地よい和音（コード）が鳴り、複雑な指使いを覚える必要はありません。
                        楽曲制作のアイデア出しや、リラックスして音と戯れるのに最適です。
                    </Text>
                </Section>

                <Section>
                    <SectionTitle>用意するもの</SectionTitle>
                    <List>
                        <li>パソコン（この画面を開いている端末）</li>
                        <li>(推奨) MIDIケーブルで接続されたシンセサイザーや電子ピアノなど。
                            <br /><small>※無い場合は、ブラウザ内蔵の簡易音源で音が鳴ります。</small>
                        </li>
                    </List>
                </Section>

                <Section>
                    <SectionTitle>使い方</SectionTitle>
                    <List>
                        <li>
                            <strong>1. 接続 (MIDIがある場合):</strong><br />
                            右上の「Settings」ボタンから、お使いのMIDI機器を出力先に選択してください。
                        </li>
                        <li>
                            <strong>2. 演奏する:</strong><br />
                            画面中央の四角いボタン（コードグリッド）をクリックまたはタップしてください。音が鳴ります。
                            マウスを押したままドラッグすると、滑らかに次のコードへ移動できます。
                        </li>
                        <li>
                            <strong>3. 雰囲気を変える:</strong><br />
                            上のナビゲーションバー（C, G, F...）を押すと、全体のキー（調）が変わり、響きの雰囲気が変化します。
                        </li>
                        <li>
                            <strong>4. Auto機能で遊ぶ:</strong><br />
                            画面下のコントロールパネルで「Auto」をONにすると、自動でリズムを刻み始めます。
                            「UP/DOWN」ボタンで進行方向を変えたり、「Sad/Tension」でエモーショナルな展開を作ったりできます。
                        </li>
                    </List>
                </Section>

                <CloseButton onClick={onClose}>閉じる</CloseButton>
            </Modal>
        </Overlay>
    );
}
