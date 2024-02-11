// charts.tsx/jsx

'use client'; // if you use app dir, don't forget this line

import { off } from 'process';

import dynamic from 'next/dynamic';


import { number } from 'prop-types';
const ApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface SensorData {
  time: number[];
  temperature: number[];
  pressure: number[];
  humidity: number[];
  altitude: number[];
  a0: number[];
  a1: number[];
  a2: number[];
  a3: number[];
}

function parseData(data: string): SensorData {
  const lines = data.trim().split('\n');
  const keys = lines[0].split(',').map((key) => key.trim());

  const sensorData: SensorData = {
    time: [],
    temperature: [],
    pressure: [],
    humidity: [],
    altitude: [],
    a0: [],
    a1: [],
    a2: [],
    a3: [],
  };

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map((value) => parseFloat(value.trim()));
    sensorData.time.push(values[0]);
    sensorData.temperature.push(values[1]);
    sensorData.pressure.push(values[2]);
    sensorData.humidity.push(values[3]);
    sensorData.altitude.push(values[4]);
    sensorData.a0.push(values[5]);
    sensorData.a1.push(values[6]);
    sensorData.a2.push(values[7]);
    sensorData.a3.push(values[8]);
  }

  return sensorData;
}
const aryMax = function (a: number, b: number) {
  return Math.max(a, b);
};
const aryMin = function (a: number, b: number) {
  return Math.min(a, b);
};

export function TempChart({
  data,
  recordTime,
  chargeTime,
  airTime,
}: {
  data: string;
  recordTime: string;
  chargeTime: string;
  airTime: string;
}) {
  if (!data) {
    return <div>データを選択してください</div>;
  }

  const n_data: SensorData = parseData(data);
  const option = {
    chart: {
      id: 'temperature',
      fontFamily: 'a-otf-ud-shin-go-pr6n',
    },
    xaxis: {
      title: {
        text: '時間(s)',
      },
      categories: n_data['time'],
      type: 'numeric' as 'numeric',
    },
    yaxis: {
      title: {
        text: '温度(℃)',
      },
      labels: {
        formatter: function (value: number) {
          return value + '℃';
        },
      },
    },

    title: {
      text: '外気温度, 内部温度(a0～a3)',
    },
    dataLabels: {
      enabled: false,
    },
    markers: {
      size: 0,
      style: 'hollow',
    },
    annotations: {
      yaxis: [
        {
          y: n_data['temperature'].reduce(aryMin),
          borderColor: '#00E396',
          label: {
            borderColor: '#00E396',
            style: {
              color: '#fff',
              background: '#00E396',
            },
            text: 'min',
          },
        },
        {
          y: n_data['temperature'].reduce(aryMax),
          borderColor: '#00E396',
          label: {
            borderColor: '#00E396',
            style: {
              color: '#fff',
              background: '#00E396',
            },
            text: 'Max',
            ofsetX: n_data['time'].indexOf(n_data['temperature'].reduce(aryMax)),
          },
        },
        {
          y: n_data['temperature'].reduce(aryMin),
          y2: n_data['temperature'].reduce(aryMax),
          borderColor: '#000',
          fillColor: '#FEB019',
          opacity: 0.3,
          label: {
            // borderColor: '#333',
            style: {
              fontSize: '10px',
              color: '#333',
              background: '#FEB019',
            },
            offsetY: 30,
            text: '滞空',
          },
        },
      ],
      xaxis: [
        {
          x: Number(airTime),
          strokeDashArray: 0,
          borderColor: '#775DD0',
          label: {
            borderColor: '#775DD0',
            style: {
              color: '#fff',
              background: '#775DD0',
            },
            offsetY: -10,
            orientation: 'horizontal',
            text: '着陸',
          },
        },
        {
          x: 0,
          strokeDashArray: 0,
          borderColor: '#775DD0',
          label: {
            borderColor: '#775DD0',
            style: {
              color: '#fff',
              background: '#775DD0',
            },
            offsetY: -10,
            orientation: 'horizontal',
            text: '離陸',
          },
        },
        {
          x: 0 - Number(chargeTime),
          x2: 0,
          fillColor: '#B3F7CA',
          opacity: 0.3,
          label: {
            borderColor: '#B3F7CA',
            style: {
              fontSize: '10px',
              color: '#fff',
              background: '#00E396',
            },
            offsetY: -10,
            offsetX: 30,
            orientation: 'horizontal',
            text: '気体充填',
          },
        },
      ],
    },
  };

  const series = [
    {
      name: '温度',
      data: n_data['temperature'],
    },
    {
      name: 'a0',
      data: n_data['a0'],
    },
    {
      name: 'a1',
      data: n_data['a1'],
    },
    {
      name: 'a2',
      data: n_data['a2'],
    },
    {
      name: 'a3',
      data: n_data['a3'],
    },
  ];

  return (
    <>
      <ApexChart type='line' options={option} series={series} height={350} width={500} />
    </>
  );
}
