import { useState, useRef } from 'react'
import './App.css'

function App() {
  const [file, setFile] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processSuccess, setProcessSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [results, setResults] = useState(null)
  const [viewMode, setViewMode] = useState('bonus') // 'bonus' | 'all'
  const [searchQuery, setSearchQuery] = useState('')
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0]
    if (selected) {
      if (!selected.name.endsWith('.xlsx') && !selected.name.endsWith('.xls')) {
        setErrorMessage('Invalid file format. Please upload an Excel (.xlsx or .xls) file.')
        setFile(null)
        setProcessSuccess(false)
        setResults(null)
        return
      }
      setFile(selected)
      setErrorMessage('')
      setProcessSuccess(false)
      setResults(null)
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
        setResults(null)
        return
      }
      setFile(droppedFile)
      setErrorMessage('')
      setProcessSuccess(false)
      setResults(null)
    }
  }

  const handleRemoveFile = (e) => {
    e.stopPropagation()
    setFile(null)
    setErrorMessage('')
    setProcessSuccess(false)
    setResults(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) {
      setErrorMessage('No file selected. Please choose an Excel file to process.')
      setProcessSuccess(false)
      return
    }

    setIsProcessing(true)
    setErrorMessage('')
    setProcessSuccess(false)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('http://localhost:5000/api/upload-tolls', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Server encountered an error while processing.')
      }

      setResults(data)
      setProcessSuccess(true)
      if (data.bonusTrucks && data.bonusTrucks.length > 0) {
        setViewMode('bonus')
      } else {
        setViewMode('all')
      }
    } catch (err) {
      console.error(err)
      setErrorMessage(
        err.message === 'Failed to fetch'
          ? 'Cannot reach the Node server. Please ensure the backend is running on http://localhost:5000'
          : err.message
      )
      setProcessSuccess(false)
      setResults(null)
    } finally {
      setIsProcessing(false)
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (isoStr) => {
    if (!isoStr) return 'N/A'
    const d = new Date(isoStr)
    if (isNaN(d.getTime())) return 'N/A'
    return d.toLocaleString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const displayedTrucks = results
    ? (viewMode === 'bonus' ? results.bonusTrucks : results.allTrucks).filter(truck =>
        truck.truckId.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : []

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-start p-6 md:p-12 selection:bg-purple-500 selection:text-white">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-purple-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-[500px] h-[350px] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Content Container */}
      <div className={`relative z-10 w-full transition-all duration-300 flex flex-col items-center ${results ? 'max-w-5xl' : 'max-w-2xl'}`}>

        {/* Top Tag & Live Badge */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-purple-900/40 border border-purple-500/30 text-purple-200 text-xs font-semibold uppercase tracking-wider mb-6 backdrop-blur-md shadow-inner shadow-purple-500/10">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
          </span>
          Royal Atlas • 50 AED Bonus Program
        </div>

        {/* Header Section */}
        <header className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-b from-white via-slate-100 to-purple-200 bg-clip-text text-transparent drop-shadow-sm">
            TOLL GATE MANAGEMENT SYSTEM
          </h1>
          <p className="mt-3 text-purple-300/80 text-sm md:text-base max-w-xl mx-auto">
            12-Hour Transit Bonus Calculator — <span className="text-amber-300 font-semibold">50 AED Bonus</span> for drivers with 2+ passes in any 12-hour window
          </p>
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
              className={`w-full relative flex flex-col items-center justify-center p-8 md:p-10 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-300 group ${
                isDragging
                  ? 'border-purple-400 bg-purple-600/20 scale-[1.01]'
                  : errorMessage
                    ? 'border-rose-500/40 bg-rose-950/15 hover:border-rose-400/60'
                    : file
                      ? 'border-amber-400/60 bg-amber-950/15 hover:border-amber-400'
                      : 'border-purple-500/30 bg-purple-950/20 hover:border-purple-400/60 hover:bg-purple-900/20'
              }`}
            >
              {!file ? (
                <>
                  <div className="w-16 h-16 mb-4 rounded-2xl bg-gradient-to-tr from-purple-800/40 to-indigo-700/40 border border-purple-400/30 flex items-center justify-center group-hover:scale-110 group-hover:border-purple-400 transition-all duration-300 shadow-lg shadow-purple-900/30">
                    <svg className="w-8 h-8 text-purple-300 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>

                  <div className="space-y-1 text-center">
                    <p className="text-base font-semibold text-white">
                      Drop your transit Excel file here, or{' '}
                      <span className="text-purple-400 group-hover:text-purple-300 underline underline-offset-4 transition-colors">
                        browse
                      </span>
                    </p>
                    <p className="text-xs text-purple-300/60 font-medium">
                      Supports <span className="text-purple-200">.XLSX</span> or <span className="text-purple-200">.XLS</span> report files
                    </p>
                  </div>
                </>
              ) : (
                <div className="w-full flex items-center justify-between gap-4 p-4 rounded-xl bg-purple-900/40 border border-purple-500/40 shadow-inner">
                  <div className="flex items-center gap-3.5 text-left truncate">
                    <div className="w-12 h-12 shrink-0 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 font-bold text-xs tracking-wider">
                      .XLSX
                    </div>
                    <div className="truncate">
                      <p className="text-sm font-semibold text-white truncate max-w-[280px] md:max-w-[360px]">
                        {file.name}
                      </p>
                      <p className="text-xs text-purple-300/70 mt-0.5">
                        {formatFileSize(file.size)} • Ready to calculate bonuses
                      </p>
                    </div>
                  </div>

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
              <div className="w-full flex items-center justify-between gap-3 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-sm font-medium">
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
              <div className="w-full flex items-center justify-between gap-3 p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-sm font-medium">
                <div className="flex items-center gap-3 truncate text-left">
                  <svg className="w-5 h-5 shrink-0 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="truncate">
                    Report analyzed! {results?.totalTrucksFound || 0} drivers scanned • {results?.bonusEligibleCount || 0} bonus qualifiers found.
                  </span>
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
              className={`w-full py-3.5 px-6 rounded-xl font-semibold text-base transition-all duration-300 flex items-center justify-center gap-2.5 shadow-lg ${
                !file
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
                  Calculating 12-Hour Bonuses...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 text-amber-300" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Calculate 50 AED Driver Bonuses
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results Analysis View */}
        {results && (
          <div className="w-full mt-10 space-y-6">

            {/* Summary Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="glass-panel rounded-2xl p-5 border border-purple-500/20 text-left">
                <p className="text-xs text-purple-300/70 font-medium uppercase tracking-wider">Total Drivers Scanned</p>
                <p className="text-3xl font-extrabold text-white mt-1.5">{results.totalTrucksFound}</p>
                <p className="text-xs text-purple-400/80 mt-1">Unique trucks in transit log</p>
              </div>

              <div className="glass-panel rounded-2xl p-5 border border-amber-500/30 text-left bg-amber-950/20">
                <p className="text-xs text-amber-300/80 font-medium uppercase tracking-wider">Bonus Qualifiers (2+ in 12h)</p>
                <p className="text-3xl font-extrabold text-amber-300 mt-1.5">{results.bonusEligibleCount}</p>
                <p className="text-xs text-amber-200/70 mt-1">
                  Passed multiple times within 12h
                </p>
              </div>

              <div className="glass-panel rounded-2xl p-5 border border-emerald-500/30 text-left bg-emerald-950/20">
                <p className="text-xs text-emerald-300/80 font-medium uppercase tracking-wider">Total Bonus Payout</p>
                <p className="text-3xl font-extrabold text-emerald-400 mt-1.5">
                  {results.totalBonusPayout} <span className="text-lg font-bold text-emerald-300">AED</span>
                </p>
                <p className="text-xs text-emerald-300/70 mt-1">50 AED awarded per qualified driver</p>
              </div>
            </div>

            {/* Detailed Table Section */}
            <div className="glass-panel rounded-3xl p-6 md:p-8 border border-purple-500/20 shadow-2xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                    <span>Driver Bonus Breakdown</span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      50 AED / Qualified
                    </span>
                  </h2>
                  <p className="text-xs text-purple-300/70 mt-0.5">
                    Showing {displayedTrucks.length} truck{displayedTrucks.length !== 1 ? 's' : ''}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* View Mode Toggle Buttons */}
                  <div className="flex bg-purple-950/60 p-1 rounded-xl border border-purple-500/20">
                    <button
                      type="button"
                      onClick={() => setViewMode('bonus')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        viewMode === 'bonus'
                          ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-900/40'
                          : 'text-purple-300 hover:text-white'
                      }`}
                    >
                      Bonus Earned ({results.bonusEligibleCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('all')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        viewMode === 'all'
                          ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40'
                          : 'text-purple-300 hover:text-white'
                      }`}
                    >
                      All Drivers ({results.totalTrucksFound})
                    </button>
                  </div>

                  {/* Search Filter */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Filter truck plate..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="px-3.5 py-1.5 pl-8 rounded-xl bg-purple-950/50 border border-purple-500/30 text-white text-xs placeholder-purple-400/50 focus:outline-none focus:border-purple-400"
                    />
                    <svg className="w-3.5 h-3.5 text-purple-400/70 absolute left-2.5 top-2.5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Table or Empty State */}
              {displayedTrucks.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <div className="w-14 h-14 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-300 mb-3">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-base font-bold text-white">No Drivers in this View</h3>
                  <p className="text-xs text-purple-300/70 max-w-sm mt-1">
                    {viewMode === 'bonus'
                      ? 'None of the trucks in this report passed 2 or more times within a single 12-hour window. Switch to "All Drivers" to inspect individual crossing histories.'
                      : 'No trucks match your search query.'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-purple-500/20 text-purple-300/70 uppercase tracking-wider font-semibold">
                        <th className="py-3 px-4">Truck License / Plate</th>
                        <th className="py-3 px-4 text-center">Total Passes</th>
                        <th className="py-3 px-4 text-center">Max Passes in 12h</th>
                        <th className="py-3 px-4">Fastest 12h Interval</th>
                        <th className="py-3 px-4 text-right">Bonus Reward</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-500/10 text-white">
                      {displayedTrucks.map((truck) => {
                        const qualifies = truck.isBonusEligible
                        return (
                          <tr key={truck.truckId} className="hover:bg-purple-900/20 transition-colors">
                            <td className="py-3.5 px-4 font-bold text-purple-200">
                              <span className="px-2.5 py-1 rounded-md bg-purple-900/50 border border-purple-500/30">
                                {truck.truckId}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-center font-medium">
                              {truck.totalPasses}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-bold ${
                                qualifies
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : 'bg-purple-500/20 text-purple-300 border border-purple-500/20'
                              }`}>
                                {truck.maxPassesIn12Hours}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-purple-300/80">
                              {truck.windowStartTime ? (
                                <div>
                                  <span>{formatDate(truck.windowStartTime)}</span>
                                  {truck.windowEndTime && truck.windowEndTime !== truck.windowStartTime && (
                                    <>
                                      <span className="mx-1 text-purple-400">→</span>
                                      <span>{formatDate(truck.windowEndTime)}</span>
                                    </>
                                  )}
                                </div>
                              ) : (
                                'Single event'
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              {qualifies ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-extrabold text-xs shadow-sm">
                                  <span>+50 AED BONUS</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-purple-900/30 border border-purple-500/20 text-purple-300/70 font-medium">
                                  Standard (0 AED)
                                </span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  )
}

export default App
