import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const imageFile = formData.get('image') as File

  if (!imageFile) {
    return NextResponse.json({ error: '画像が見つかりません' }, { status: 400 })
  }

  const bytes = await imageFile.arrayBuffer()
  const base64 = Buffer.from(bytes).toString('base64')
  const mediaType = (imageFile.type || 'image/jpeg') as
    | 'image/jpeg'
    | 'image/png'
    | 'image/webp'
    | 'image/gif'

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mediaType, data: base64 },
          },
          {
            type: 'text',
            text: `この画像は手紙を書くための紙です。以下を詳しく分析してください。

【分析してほしいこと】
1. 紙の種類（便箋・原稿用紙・方眼紙・無地・その他）
2. 書き方向（横書き・縦書き）
3. 実際に文字を書ける行数
4. 1行あたりの推定文字数（罫線の間隔・枠のサイズから判断）
5. 画像内に手書き文字が1文字だけ書いてある場合：
   - その文字を見つけられたか（true/false）
   - その文字の実際のサイズに基づく1行の文字数
   - その文字サイズで書いた場合の合計文字数
6. 全体の合計推定文字数

必ず以下のJSON形式のみで回答してください（説明文は不要）：
{
  "paperType": "便箋",
  "writingDirection": "横書き",
  "rows": 20,
  "charsPerRow": 25,
  "totalChars": 500,
  "calibrationCharFound": false,
  "charsPerRowWithCalibration": null,
  "totalCharsWithCalibration": null,
  "notes": "A4サイズの一般的な便箋です。罫線が20行確認できます。"
}`,
          },
        ],
      },
    ],
  })

  const text =
    message.content[0].type === 'text' ? message.content[0].text : ''

  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    return NextResponse.json({ error: '分析結果の解析に失敗しました' }, { status: 500 })
  }

  try {
    const result = JSON.parse(jsonMatch[0])
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: '分析に失敗しました' }, { status: 500 })
  }
}
