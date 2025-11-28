import './App.css'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Line, Dot, ComposedChart } from 'recharts'
import { useState } from 'react'

function App() {
  const [viewMode, setViewMode] = useState('weekly') // 'weekly', 'monthly', 'yearly'

  // Generate days for November 2025 with weekday names
  const getDaysInNovember = () => {
    const days = []
    const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
    
    for (let day = 1; day <= 30; day++) {
      // November 2025 starts on a Saturday (day 0 = Saturday)
      const date = new Date(2025, 10, day) // Month is 0-indexed, so 10 = November
      const weekdayIndex = date.getDay()
      
      days.push({
        day: day,
        weekday: weekdays[weekdayIndex],
        label: `${day}\n${weekdays[weekdayIndex]}`,
        // Initialize all days with empty bars
        start: null,
        end: null,
        color: 'transparent'
      })
    }
    
    return days
  }

  const data = getDaysInNovember()
  
  // Define which days should be green (70%) - randomly distributed
  const greenDays = [1, 2, 3, 5, 6, 7, 9, 10, 11, 13, 14, 15, 17, 18, 19, 20, 21, 23, 24, 26, 27]
  const redDays = [4, 8, 12, 16, 22, 25, 28]
  const blueDays = [29, 30]
  const doublShiftDays = [6, 15, 24] // Days with two shifts
  
  // Set all days to have full bars (0 to 24) with transparent background
  data.forEach((day, index) => {
    const date = new Date(2025, 10, index + 1)
    const weekdayIndex = date.getDay()
    const dayNum = index + 1
    
    day.fullBar = 24 // Full bar for all days
    day.isSaturday = weekdayIndex === 6
    day.isSunday = weekdayIndex === 0
    day.worker = 'Dhanush'
    day.task = 'Work Cleaning'
    day.location = 'USA'
    
    // Determine color based on day
    let color
    if (blueDays.includes(dayNum)) {
      color = '#60a5fa' // blue
    } else if (greenDays.includes(dayNum)) {
      color = '#4ade80' // green
    } else if (redDays.includes(dayNum)) {
      color = '#ef4444' // red
    } else {
      color = 'transparent'
    }
    
    // Check if this day has double shift
    if (doublShiftDays.includes(dayNum)) {
      // First shift
      day.taskStart = Math.floor(Math.random() * 3) + 2 // 2-5
      day.taskDuration = Math.floor(Math.random() * 3) + 4 // 4-7 hours
      day.taskColor = color
      
      // Second shift (store separately for rendering)
      day.taskStart2 = Math.floor(Math.random() * 4) + 14 // 14-18
      day.taskDuration2 = Math.floor(Math.random() * 3) + 4 // 4-7 hours
      day.taskColor2 = color
      day.hasDoubleShift = true
    } else {
      // Single shift - random work hours
      day.taskStart = Math.floor(Math.random() * 10) + 2 // Random start between 2-12
      day.taskDuration = Math.floor(Math.random() * 8) + 4 // Random duration between 4-12 hours
      day.taskColor = color
      day.hasDoubleShift = false
    }
  })

  // Custom shape for rendering task bars at correct position
  const TaskBar = (props) => {
    const { x, y, width, height, fill, index } = props
    const dayData = data[index]
    
    if (dayData.taskDuration === 0) return null
    
    // Calculate Y position based on taskStart
    const chartHeight = height // This is the full bar height (24 hours)
    const hourHeight = chartHeight / 24
    
    // First shift
    const taskY = y + (24 - dayData.taskStart - dayData.taskDuration) * hourHeight
    const taskHeight = dayData.taskDuration * hourHeight
    
    return (
      <>
        {/* First shift */}
        <rect
          x={x}
          y={taskY}
          width={width}
          height={taskHeight}
          fill={dayData.taskColor}
          stroke="#d1d5db"
          strokeWidth={1}
        />
        {/* Second shift if exists */}
        {dayData.hasDoubleShift && (
          <rect
            x={x}
            y={y + (24 - dayData.taskStart2 - dayData.taskDuration2) * hourHeight}
            width={width}
            height={dayData.taskDuration2 * hourHeight}
            fill={dayData.taskColor2}
            stroke="#d1d5db"
            strokeWidth={1}
          />
        )}
      </>
    )
  }

  // Generate monthly data (12 months)
  const getMonthlyData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const hours = [180, 160, 145, 170, 155, 190, 165, 150, 175, 140, 185, 160] // Different hours for each month
    const leaveDays = [5, 3, 8, 2, 6, 4, 7, 3, 5, 9, 4, 6] // Leave days for each month (0-31)
    return months.map((month, index) => ({
      month: month,
      hours: hours[index],
      leaveDays: leaveDays[index],
      taskColor: '#c084fc' // light purple for all months
    }))
  }

  // Generate yearly data (past 10 years)
  const getYearlyData = () => {
    const currentYear = 2025
    const years = []
    const hours = [320, 280, 350, 420, 380, 460, 400, 340, 480, 450] // Different hours for each year
    for (let i = 9; i >= 0; i--) {
      const year = currentYear - i
      years.push({
        year: year.toString(),
        hours: hours[9 - i],
        taskColor: '#fb923c' // light orange for all years
      })
    }
    return years
  }

  const monthlyData = getMonthlyData()
  const yearlyData = getYearlyData()

  // Custom shape for monthly/yearly view
  const TaskBarGeneric = (props) => {
    const { x, y, width, height, fill, index } = props
    const currentData = viewMode === 'monthly' ? monthlyData : yearlyData
    const itemData = currentData[index]
    
    if (!itemData || itemData.taskDuration === 0) return null
    
    const chartHeight = height
    const hourHeight = chartHeight / 24
    const taskY = y + (24 - itemData.taskStart - itemData.taskDuration) * hourHeight
    const taskHeight = itemData.taskDuration * hourHeight
    
    return (
      <rect
        x={x}
        y={taskY}
        width={width}
        height={taskHeight}
        fill={itemData.taskColor}
        stroke="#d1d5db"
        strokeWidth={1}
      />
    )
  }

  return (
    <div className="App" style={{ padding: '0', margin: '0', backgroundColor: 'white', minHeight: '100vh', width: '100vw', boxSizing: 'border-box' }}>
      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        width: '100%',
        boxSizing: 'border-box'
      }}>
        {/* Header */}
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ margin: '0 0 5px 0', fontSize: '20px', fontWeight: '600' }}>
            Worker Name: Dhanush Kumar
          </h2>
          <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>
            Service ID: 12345
          </p>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: '500', color: '#666' }}>
            November 2025
          </h3>
          
          {/* Dropdown for view mode */}
          <div style={{ marginBottom: '15px' }}>
            <select 
              value={viewMode} 
              onChange={(e) => setViewMode(e.target.value)}
              style={{
                padding: '8px 12px',
                fontSize: '14px',
                borderRadius: '5px',
                border: '1px solid #d1d5db',
                backgroundColor: 'white',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        </div>

        {/* Productivity indicator for monthly and yearly view */}
        {viewMode === 'monthly' && (
          <>
            <div style={{ 
              marginBottom: '20px', 
              padding: '10px 15px', 
              backgroundColor: '#f0fdf4', 
              borderLeft: '4px solid #4ade80',
              borderRadius: '5px'
            }}>
              <p style={{ margin: '0', color: '#166534', fontSize: '14px', fontWeight: '500' }}>
                📈 5% productivity has increased from last month
              </p>
            </div>
            <div style={{ 
              marginBottom: '20px', 
              padding: '10px 15px', 
              backgroundColor: '#fff7ed', 
              borderLeft: '4px solid #fb923c',
              borderRadius: '5px'
            }}>
              <p style={{ margin: '0', color: '#9a3412', fontSize: '14px', fontWeight: '500' }}>
                📅 Total leave taken for this year = 62 days
              </p>
            </div>
          </>
        )}
        {viewMode === 'yearly' && (
          <div style={{ 
            marginBottom: '20px', 
            padding: '10px 15px', 
            backgroundColor: '#fef2f2', 
            borderLeft: '4px solid #ef4444',
            borderRadius: '5px'
          }}>
            <p style={{ margin: '0', color: '#991b1b', fontSize: '14px', fontWeight: '500' }}>
              📉 2% productivity has decreased from last year
            </p>
          </div>
        )}

        {/* Legend */}
        <div style={{ 
          display: 'flex', 
          gap: '30px', 
          marginBottom: '20px',
          fontSize: '14px',
          justifyContent: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ 
              width: '20px', 
              height: '20px', 
              backgroundColor: '#4ade80',
              borderRadius: '3px'
            }}></div>
            <span>Work Completed</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ 
              width: '20px', 
              height: '20px', 
              backgroundColor: '#60a5fa',
              borderRadius: '3px'
            }}></div>
            <span>Task Assigned</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ 
              width: '20px', 
              height: '20px', 
              backgroundColor: '#ef4444',
              borderRadius: '3px'
            }}></div>
            <span>Absent/Work Incomplete</span>
          </div>
        </div>

        {/* Chart */}
        <div style={{ width: '100%', height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            {viewMode === 'weekly' ? (
            <BarChart 
              data={data} 
              margin={{ top: 20, right: 10, left: 10, bottom: 20 }}
              barCategoryGap="2%"
              barGap={0}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis 
                dataKey="day"
                tick={({ x, y, payload }) => {
                  const item = data[payload.index]
                  const weekdayColor = (item.isSaturday || item.isSunday) ? '#ef4444' : '#666'
                  return (
                    <g transform={`translate(${x},${y})`}>
                      <text x={0} y={0} dy={10} textAnchor="middle" fill="#666" fontSize={11}>
                        {item.day}
                      </text>
                      <text x={0} y={0} dy={24} textAnchor="middle" fill={weekdayColor} fontSize={11}>
                        {item.weekday}
                      </text>
                    </g>
                  )
                }}
                interval={0}
                height={50}
                axisLine={{ stroke: '#d1d5db' }}
                tickLine={false}
              />
              <YAxis 
                domain={[0, 24]}
                ticks={[0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24]}
                tick={{ fontSize: 12 }}
                label={{ value: 'Hours', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload[0]) {
                    const data = payload[0].payload
                    if (data.taskDuration > 0) {
                      let status = ''
                      if (data.taskColor === '#4ade80') status = 'Work Completed'
                      else if (data.taskColor === '#60a5fa') status = 'Task Assigned'
                      else if (data.taskColor === '#ef4444') status = 'Absent/Work Incomplete'
                      
                      return (
                        <div style={{ 
                          backgroundColor: 'white', 
                          padding: '12px 15px', 
                          border: '1px solid #ccc',
                          borderRadius: '5px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                        }}>
                          <p style={{ margin: '0 0 8px 0', fontWeight: '600', fontSize: '14px' }}>Day {data.day}</p>
                          <p style={{ margin: '0 0 5px 0', fontSize: '13px' }}>
                            <strong>Worker:</strong> {data.worker}
                          </p>
                          <p style={{ margin: '0 0 5px 0', fontSize: '13px' }}>
                            <strong>Task:</strong> {data.task}
                          </p>
                          <p style={{ margin: '0 0 5px 0', fontSize: '13px' }}>
                            <strong>Location:</strong> {data.location}
                          </p>
                          <p style={{ margin: '0 0 5px 0', fontSize: '13px' }}>
                            <strong>Time:</strong> {data.taskStart}:00 - {data.taskStart + data.taskDuration}:00
                            {data.hasDoubleShift && `, ${data.taskStart2}:00 - ${data.taskStart2 + data.taskDuration2}:00`}
                          </p>
                          <p style={{ margin: '0', fontSize: '13px' }}>
                            <strong>Status:</strong> {status}
                          </p>
                        </div>
                      )
                    }
                  }
                  return null
                }}
              />
              {/* Base transparent bars for all days with gray border */}
              <Bar 
                dataKey="fullBar" 
                fill="transparent" 
                stroke="#d1d5db" 
                strokeWidth={1} 
                isAnimationActive={false}
                cursor="default"
              />
              {/* Colored task bars overlaid on top at specific positions */}
              <Bar 
                dataKey="fullBar" 
                shape={<TaskBar />} 
                isAnimationActive={false}
                cursor="pointer"
              />
            </BarChart>
            ) : viewMode === 'monthly' ? (
              <ComposedChart 
                data={monthlyData} 
                margin={{ top: 20, right: 50, left: 10, bottom: 20 }}
                barCategoryGap="35%"
                barGap={0}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis 
                  dataKey="month"
                  tick={{ fontSize: 12 }}
                  axisLine={{ stroke: '#d1d5db' }}
                  tickLine={false}
                />
                <YAxis 
                  yAxisId="left"
                  domain={[0, 200]}
                  ticks={[0, 40, 80, 120, 160, 200]}
                  tick={{ fontSize: 12 }}
                  label={{ value: 'Hours', angle: -90, position: 'insideLeft' }}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  domain={[0, 31]}
                  ticks={[0, 5, 10, 15, 20, 25, 31]}
                  tick={{ fontSize: 12 }}
                  label={{ value: 'Leave Days', angle: 90, position: 'insideRight' }}
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload[0]) {
                      const data = payload[0].payload
                      if (data.hours > 0) {
                        return (
                          <div style={{ 
                            backgroundColor: 'white', 
                            padding: '12px 15px', 
                            border: '1px solid #ccc',
                            borderRadius: '5px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                          }}>
                            <p style={{ margin: '0 0 8px 0', fontWeight: '600', fontSize: '14px' }}>{data.month}</p>
                            <p style={{ margin: '0 0 5px 0', fontSize: '13px' }}>
                              <strong>Total Hours:</strong> {data.hours} hrs
                            </p>
                            <p style={{ margin: '0', fontSize: '13px' }}>
                              <strong>Leave Days:</strong> {data.leaveDays} days
                            </p>
                          </div>
                        )
                      }
                    }
                    return null
                  }}
                />
                <Bar 
                  yAxisId="left"
                  dataKey="hours" 
                  fill="#c084fc" 
                  stroke="#d1d5db" 
                  strokeWidth={1} 
                  isAnimationActive={false}
                  cursor="pointer"
                />
                <Line 
                  yAxisId="right"
                  type="monotone"
                  dataKey="leaveDays"
                  stroke="#fb923c"
                  strokeWidth={2}
                  dot={{ fill: '#fb923c', r: 5 }}
                  activeDot={{ r: 7 }}
                  isAnimationActive={false}
                />
              </ComposedChart>
            ) : (
              <BarChart 
                data={yearlyData} 
                margin={{ top: 20, right: 10, left: 10, bottom: 20 }}
                barCategoryGap="35%"
                barGap={0}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis 
                  dataKey="year"
                  tick={{ fontSize: 12 }}
                  axisLine={{ stroke: '#d1d5db' }}
                  tickLine={false}
                />
                <YAxis 
                  domain={[0, 500]}
                  ticks={[0, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500]}
                  tick={{ fontSize: 12 }}
                  label={{ value: 'Hours', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload[0]) {
                      const data = payload[0].payload
                      if (data.hours > 0) {
                        return (
                          <div style={{ 
                            backgroundColor: 'white', 
                            padding: '12px 15px', 
                            border: '1px solid #ccc',
                            borderRadius: '5px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                          }}>
                            <p style={{ margin: '0 0 8px 0', fontWeight: '600', fontSize: '14px' }}>Year {data.year}</p>
                            <p style={{ margin: '0', fontSize: '13px' }}>
                              <strong>Total Hours:</strong> {data.hours} hrs
                            </p>
                          </div>
                        )
                      }
                    }
                    return null
                  }}
                />
                <Bar 
                  dataKey="hours" 
                  fill="#fb923c" 
                  stroke="#d1d5db" 
                  strokeWidth={1} 
                  isAnimationActive={false}
                  cursor="pointer"
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default App
