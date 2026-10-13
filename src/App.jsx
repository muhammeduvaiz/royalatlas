import { useState, useRef } from 'react'
import './App.css'

function App() {
  const [file, setFile] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processSuccess, setProcessSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0]
    if (selected) {
      if (!selected.name.endsWith('.xlsx') && !selected.name.endsWith('.xls')) {
        setErrorMessage('Invalid file format. Please upload an Excel (.xlsx or .xls) file.')
        setFile(null)
        setProcessSuccess(false)
        return
      }
      setFile(selected)
      setErrorMessage('')
      setProcessSuccess(false)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files?.[0]
    if (droppedFile) {
      if (!droppedFile.name.endsWith('.xlsx') && !droppedFile.name.endsWith('.xls')) {
        setErrorMessage('Invalid file format. Please upload an Excel (.xlsx or .xls) file.')
        setFile(null)
        setProcessSuccess(false)
        return
      }
      setFile(droppedFile)
      setErrorMessage('')
      setProcessSuccess(false)
    }
  }

  const handleRemoveFile = (e) => {
    e.stopPropagation()
    setFile(null)
    setErrorMessage('')
    setProcessSuccess(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!file) {
      setErrorMessage('No file selected. Please choose an Excel file to process.')
      setProcessSuccess(false)
      return
    }

    setIsProcessing(true)
    setErrorMessage('')
    setProcessSuccess(false)

    setTimeout(() => {
      setIsProcessing(false)
      if (file.size === 0) {
        setErrorMessage('The uploaded Excel file is empty. Please upload a valid report.')
        setProcessSuccess(false)
      } else {
        setProcessSuccess(true)
        setErrorMessage('')
      }
    }, 1500)
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-6 selection:bg-purple-500 selection:text-white">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-purple-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-[450px] h-[300px] bg-indigo-600/15 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Content Container */}
      <div className="relative z-10 w-full max-w-2xl flex flex-col items-center text-center">

        {/* Top Tag & Live Badge */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-purple-900/40 border border-purple-500/30 text-purple-200 text-xs font-semibold uppercase tracking-wider mb-6 backdrop-blur-md shadow-inner shadow-purple-500/10">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
          </span>
          Royal Atlas
        </div>

        {/* Header Section */}
        <header className="mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-b from-white via-slate-100 to-purple-200 bg-clip-text text-transparent drop-shadow-sm">
            TOLL GATE MANAGEMENT SYSTEM
          </h1>

        </header>

        {/* Glassmorphic Upload Card */}
        <div className="w-full glass-panel rounded-3xl p-8 md:p-10 shadow-2xl shadow-purple-950/80 transition-all duration-300">
          <form onSubmit={handleSubmit} className="flex flex-col items-center gap-6">

            {/* Hidden Native File Input */}
            <input
              type="file"
              id="file"
              ref={fileInputRef}
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Interactive Drop Zone Area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`w-full relative flex flex-col items-center justify-center p-8 md:p-10 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-300 group ${isDragging
                ? 'border-purple-400 bg-purple-600/20 scale-[1.01]'
                : errorMessage
                  ? 'border-rose-500/40 bg-rose-950/15 hover:border-rose-400/60'
                  : file
                    ? 'border-emerald-500/50 bg-emerald-950/15 hover:border-emerald-400'
                    : 'border-purple-500/30 bg-purple-950/20 hover:border-purple-400/60 hover:bg-purple-900/20'
                }`}
            >
              {!file ? (
                <>
                  {/* Upload Cloud Icon */}
                  <div className="w-16 h-16 mb-4 rounded-2xl bg-gradient-to-tr from-purple-800/40 to-indigo-700/40 border border-purple-400/30 flex items-center justify-center group-hover:scale-110 group-hover:border-purple-400 transition-all duration-300 shadow-lg shadow-purple-900/30">
                    <svg className="w-8 h-8 text-purple-300 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>

                  <div className="space-y-1 text-center">
                    <p className="text-base font-semibold text-white">
                      Drop your Excel file here, or{' '}
                      <span className="text-purple-400 group-hover:text-purple-300 underline underline-offset-4 transition-colors">
                        browse
                      </span>
                    </p>
                    <p className="text-xs text-purple-300/60 font-medium">
                      Supports <span className="text-purple-200">.XLSX</span> or <span className="text-purple-200">.XLS</span>
                    </p>
                  </div>
                </>
              ) : (
                /* Selected File State */
                <div className="w-full flex items-center justify-between gap-4 p-4 rounded-xl bg-purple-900/40 border border-purple-500/40 shadow-inner">
                  <div className="flex items-center gap-3.5 text-left truncate">
                    {/* Excel Sheet Badge Icon */}
                    <div className="w-12 h-12 shrink-0 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 font-bold text-xs tracking-wider">
                      .XLSX
                    </div>
                    <div className="truncate">
                      <p className="text-sm font-semibold text-white truncate max-w-[280px] md:max-w-[360px]">
                        {file.name}
                      </p>
                      <p className="text-xs text-purple-300/70 mt-0.5">
                        {formatFileSize(file.size)} • Ready to analyze
                      </p>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="p-2 rounded-lg text-purple-300/70 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
                    title="Remove file"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {/* Error Notification */}
            {errorMessage && (
              <div className="w-full flex items-center justify-between gap-3 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-sm font-medium animate-fadeIn">
                <div className="flex items-center gap-3 truncate text-left">
                  <svg className="w-5 h-5 shrink-0 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span className="truncate">{errorMessage}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setErrorMessage('')}
                  className="p-1 hover:text-white rounded-md transition-colors shrink-0 cursor-pointer"
                  title="Dismiss error"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            {/* Success Notification */}
            {processSuccess && !errorMessage && (
              <div className="w-full flex items-center justify-between gap-3 p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm font-medium animate-fadeIn">
                <div className="flex items-center gap-3 truncate text-left">
                  <svg className="w-5 h-5 shrink-0 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="truncate">Report processed successfully! All transit logs and delta timestamps parsed.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setProcessSuccess(false)}
                  className="p-1 hover:text-white rounded-md transition-colors shrink-0 cursor-pointer"
                  title="Dismiss"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            {/* Action Submit Button */}
            <button
              type="submit"
              disabled={!file || isProcessing}
              className={`w-full py-3.5 px-6 rounded-xl font-semibold text-base transition-all duration-300 flex items-center justify-center gap-2.5 shadow-lg ${!file
                ? 'bg-purple-900/30 text-purple-300/40 border border-purple-500/20 cursor-not-allowed'
                : isProcessing
                  ? 'bg-purple-700/60 text-white cursor-wait'
                  : 'glow-btn text-white hover:shadow-purple-500/40 hover:scale-[1.01] active:scale-[0.99] cursor-pointer'
                }`}
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  Processing Toll Gate Logs...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Process Transit Report
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default App
