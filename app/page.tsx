'use client'

import { useState, useRef } from 'react'

type Step = 'intro' | 'analyzing' | 'result' | 'error'

interface AnalysisResult {
  paperType: string
  writingDirection: string
  rows: number
  charsPerRow: number
  totalChars: number
  calibrationCharFound: boolean
  charsPerRowWithCalibration: number | null
  totalCharsWithCalibration: number | null
  notes: string
}

async function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    const img = new window.Image()
    img.onload = () => {
      const maxSize = 1600
      const ratio = Math.min(maxSize / img.width, maxSize / img.height, 1)
      canvas.width = Math.round(img.width * ratio)
      canvas.height = Math.round(img.height * ratio)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.85)
    }
    img.src = URL.createObjectURL(file)
  })
}

export default function Home() {
  const [step, setStep] = useState<Step>('intro')
  const [preview, setPreview] = useState('')
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setPreview(URL.createObjectURL(file))
    setStep('analyzing')
    setError('')

    try {
      const compressed = await compressImage(file)
      const formData = new FormData()
      formData.append('image', compressed, 'letter.jpg')

      const res = await fetch('/api/analyze', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error || '分析に失敗しました')

      setResult(data)
      setStep('result')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '予期せぬエラーが発生しました')
      setStep('error')
    }
  }

  function handleRetry() {
    setStep('intro')
    setPreview('')
    setResult(null)
    setError('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const mainChars = result?.totalCharsWithCalibration ?? result?.totalChars ?? 0
  const isCalibrated = result?.calibrationCharFound && result?.totalCharsWithCalibration

  return (
    <div className="min-h-dvh bg-amber-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-amber-200 px-4 py-4 flex items-center gap-3 sm:px-8">
        <div className="w-9 h-9 bg-amber-700 rounded-xl flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            {/* 封筒 */}
            <rect x="1" y="3" width="16" height="12" rx="1.5" stroke="white" strokeWidth="1.5"/>
            <path d="M1 5.5l8 5.5 8-5.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            {/* 鉛筆（右下） */}
            <g transform="translate(13, 12) rotate(-45)">
              <rect x="0" y="0" width="4" height="9" rx="0.5" fill="white"/>
              <polygon points="0,9 4,9 2,12" fill="#fbbf24"/>
              <rect x="0" y="0" width="4" height="2.5" rx="0.5" fill="#d97706"/>
            </g>
          </svg>
        </div>
        <div>
          <h1 className="text-base font-bold text-amber-900 leading-tight">何文字レター</h1>
          <p className="text-xs text-amber-600">手紙の文字数を自動判別</p>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12 w-full max-w-xl mx-auto sm:px-6">

        {/* Intro */}
        {step === 'intro' && (
          <div className="w-full space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-4xl sm:text-5xl font-bold text-amber-900">
                何文字書けるか<br />すぐにわかる
              </h2>
              <p className="text-amber-700 text-lg sm:text-xl leading-relaxed">
                手紙の写真を撮るだけで、AIが自動で文字数を計算します
              </p>
            </div>

            {/* 使い方 */}
            <div className="bg-white rounded-2xl p-5 border border-amber-200 space-y-4">
              <p className="text-sm font-bold text-amber-800">2つの使い方</p>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <span className="text-sm font-bold text-amber-700 flex-shrink-0 mt-0.5">1.</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">紙だけを撮影</p>
                    <p className="text-xs text-gray-500">罫線・枠の数から文字数を推定</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-sm font-bold text-amber-700 flex-shrink-0 mt-0.5">2.</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">紙の先頭に1文字書いて撮影</p>
                    <p className="text-xs text-gray-500 leading-relaxed">あなたの文字サイズを基準に<br />より正確な文字数を計算</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Camera button */}
            <label className="block w-full cursor-pointer">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageSelect}
                className="hidden"
              />
              <div className="w-full py-5 bg-amber-700 hover:bg-amber-800 active:bg-amber-900 rounded-2xl text-white font-bold text-lg text-center flex items-center justify-center gap-3 transition-colors shadow-lg shadow-amber-200">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                カメラで撮影する
              </div>
            </label>

            {/* File upload option */}
            <label className="block w-full cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              <div className="w-full py-4 border-2 border-amber-300 rounded-2xl text-amber-700 font-semibold text-base text-center flex items-center justify-center gap-2 hover:bg-amber-100 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                ファイルから選ぶ
              </div>
            </label>
          </div>
        )}

        {/* Analyzing */}
        {step === 'analyzing' && (
          <div className="w-full space-y-6 text-center">
            {preview && (
              <div className="rounded-2xl overflow-hidden border-2 border-amber-200 shadow-md">
                <img src={preview} alt="撮影した紙" className="w-full object-contain max-h-64 sm:max-h-96" />
              </div>
            )}
            <div className="space-y-3">
              <div className="w-12 h-12 border-4 border-amber-700 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-amber-900 font-bold text-lg">AIが分析中...</p>
              <p className="text-amber-600 text-sm">紙の種類・行数・文字数を計算しています</p>
            </div>
          </div>
        )}

        {/* Result */}
        {step === 'result' && result && (
          <div className="w-full space-y-4">
            {preview && (
              <div className="rounded-2xl overflow-hidden border-2 border-amber-200 shadow-md">
                <img src={preview} alt="撮影した紙" className="w-full object-contain max-h-48 sm:max-h-72" />
              </div>
            )}

            {/* Main result */}
            <div className="bg-amber-700 rounded-2xl p-6 text-white text-center shadow-lg">
              <p className="text-sm font-medium opacity-80 mb-1">
                {isCalibrated ? 'あなたの文字サイズで計算した結果' : '推定文字数'}
              </p>
              <p className="text-6xl font-bold mb-1">{mainChars.toLocaleString()}</p>
              <p className="text-xl font-semibold">文字</p>
              {isCalibrated && (
                <div className="mt-2 bg-white/20 rounded-lg px-3 py-1 inline-block">
                  <p className="text-xs">✦ 手書き文字から精密計算</p>
                </div>
              )}
            </div>

            {/* Detail cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-xl p-4 border border-amber-200 text-center">
                <p className="text-xs text-amber-600 mb-1">紙の種類</p>
                <p className="text-base font-bold text-amber-900">{result.paperType}</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-amber-200 text-center">
                <p className="text-xs text-amber-600 mb-1">書き方向</p>
                <p className="text-base font-bold text-amber-900">{result.writingDirection}</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-amber-200 text-center">
                <p className="text-xs text-amber-600 mb-1">行数</p>
                <p className="text-2xl font-bold text-amber-900">{result.rows}<span className="text-sm ml-1">行</span></p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-amber-200 text-center">
                <p className="text-xs text-amber-600 mb-1">1行あたり</p>
                <p className="text-2xl font-bold text-amber-900">
                  {(isCalibrated ? result.charsPerRowWithCalibration : result.charsPerRow) ?? result.charsPerRow}
                  <span className="text-sm ml-1">文字</span>
                </p>
              </div>
            </div>

            {/* Calibration notice */}
            {result.calibrationCharFound && !isCalibrated && (
              <div className="bg-amber-100 rounded-xl p-3 border border-amber-300">
                <p className="text-xs text-amber-700">手書き文字が検出されましたが、紙の罫線基準で計算しています。</p>
              </div>
            )}
            {!result.calibrationCharFound && (
              <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
                <p className="text-xs text-blue-700 leading-relaxed">
                  💡 <span className="font-semibold">より正確に計算したい場合：</span><br />
                  紙の先頭に1文字手書きして撮影すると、あなたの文字サイズで計算できます
                </p>
              </div>
            )}

            {/* Notes */}
            {result.notes && (
              <div className="bg-white rounded-xl p-3 border border-amber-200">
                <p className="text-xs text-gray-500 leading-relaxed">📋 {result.notes}</p>
              </div>
            )}

            <button
              onClick={handleRetry}
              className="w-full py-4 bg-white border-2 border-amber-700 text-amber-700 rounded-2xl font-bold text-base hover:bg-amber-50 transition-colors"
            >
              別の紙を撮影する
            </button>
          </div>
        )}

        {/* Error */}
        {step === 'error' && (
          <div className="w-full space-y-4 text-center">
            <div className="text-5xl">😔</div>
            <p className="text-amber-900 font-bold">分析できませんでした</p>
            <p className="text-amber-600 text-sm">{error}</p>
            <button onClick={handleRetry} className="w-full py-4 bg-amber-700 text-white rounded-2xl font-bold">
              もう一度試す
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
