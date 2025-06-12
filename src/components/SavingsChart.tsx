
import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Chart from 'chart.js/auto';

const SavingsChart = ({ expenses }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    
    // Process data for the last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date;
    });

    const dailyExpenses = last7Days.map(date => {
      const dayExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.toDateString() === date.toDateString();
      });
      return dayExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    });

    const dailySavings = dailyExpenses.map(expense => Math.max(500 - expense, 0)); // Assuming 500 daily budget

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: last7Days.map(date => date.toLocaleDateString('en-US', { weekday: 'short' })),
        datasets: [
          {
            label: 'Daily Savings',
            data: dailySavings,
            borderColor: 'rgb(16, 185, 129)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: 'rgb(16, 185, 129)',
            pointBorderColor: 'white',
            pointBorderWidth: 3,
            pointRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: 'white',
            bodyColor: 'white',
            borderColor: 'rgb(16, 185, 129)',
            borderWidth: 1,
            cornerRadius: 8,
            displayColors: false,
            callbacks: {
              label: function(context) {
                return `Savings: ₹${context.parsed.y.toLocaleString()}`;
              }
            }
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
            border: {
              display: false,
            },
            ticks: {
              color: '#64748b',
              font: {
                size: 12,
                weight: '500',
              },
            },
          },
          y: {
            grid: {
              color: '#f1f5f9',
              drawBorder: false,
            },
            border: {
              display: false,
            },
            ticks: {
              color: '#64748b',
              font: {
                size: 12,
              },
              callback: function(value) {
                return '₹' + value;
              },
            },
          },
        },
        elements: {
          point: {
            hoverRadius: 8,
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [expenses]);

  return (
    <Card className="rounded-2xl border-slate-200 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl text-slate-800">Savings Trend</CardTitle>
        <p className="text-sm text-slate-600">Your daily savings over the last 7 days</p>
      </CardHeader>
      <CardContent>
        <div className="h-64 relative">
          <canvas ref={chartRef}></canvas>
        </div>
      </CardContent>
    </Card>
  );
};

export default SavingsChart;
