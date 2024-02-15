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
  height,
  a0_location,
  a1_location,
  a2_location,
  a3_location,
}: {
  data: string;
  recordTime: string;
  chargeTime: string;
  airTime: string;
  height?: number | undefined;
  a0_location: string;
  a1_location: string;
  a2_location: string;
  a3_location: string;
}) {
  if (!data) {
    return <div>データを選択してください</div>;
  }

  const n_data: SensorData = parseData(data);
  console.log(n_data);

  // n_data["time"]のうち、値が0のインデックスを取得
  const zeroIndex = n_data['time'].indexOf(0);

  const option = {
    chart: {
      id: 'temperature',
      fontFamily:
        'fot-udkakugo-large-pr6n, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Hiragino Sans, Noto Sans CJK JP, Original Yu Gothic, Yu Gothic, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Sans Emoji',
    },
    xaxis: {
      categories: n_data['time'],
      type: 'numeric' as 'numeric',
    },
    yaxis: {
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
          y: n_data['a0'].slice(zeroIndex).reduce(aryMin),
          borderColor: '#00E396',
          label: {
            borderColor: 'transparent',
            style: {
              // color: '#fff',
              background: 'transparent',
            },
            text: n_data['a0'].slice(zeroIndex).reduce(aryMin).toString(),
          },
        },
        {
          y: n_data['a0'].slice(zeroIndex).reduce(aryMax),
          borderColor: '#00E396',
          label: {
            borderColor: 'transparent',
            style: {
              // color: '#fff',
              background: 'transparent',
            },
            text: n_data['a0'].slice(zeroIndex).reduce(aryMax).toString(),
            ofsetY: 10,
            ofsetX: n_data['time'].indexOf(n_data['a0'].slice(zeroIndex).reduce(aryMax)),
          },
        },
        // {
        //   y: n_data['a0'].slice(zeroIndex).reduce(aryMin),
        //   y2: n_data['a0'].slice(zeroIndex).reduce(aryMax),
        //   x: 0,
        //   x2: Number(airTime),
        //   borderColor: '#000',
        //   fillColor: '#FEB019',
        //   opacity: 0.3,
        //   label: {
        //     // borderColor: '#333',
        //     style: {
        //       fontSize: '10px',
        //       color: '#333',
        //       background: '#FEB019',
        //     },
        //     offsetY: 30,
        //     text: '滞空',
        //   },
        // },
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
          fillColor: '#00FF7F',
          opacity: 0.1,
          label: {
            borderColor: '#00FF7F',
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
      points: [
        {
          x: n_data['time'][n_data['a0'].indexOf(n_data['a0'].reduce(aryMax))],
          y: n_data['a0'].reduce(aryMax),
          marker: {
            size: 4,
            fillColor: '#fff',
            strokeColor: 'red',
            radius: 2,
            cssClass: 'apexcharts-custom-class',
          },
          label: {
            borderColor: 'transparent',
            offsetY: 0,
            fontSize: '10px',
            style: {
              color: 'red',
              background: 'transparent',
            },

            text: 'a0 ' + n_data['a0'].reduce(aryMax).toString() + '℃',
          },
        },
        {
          x: n_data['time'][n_data['a1'].indexOf(n_data['a1'].reduce(aryMax))],
          y: n_data['a1'].reduce(aryMax),
          marker: {
            size: 4,
            fillColor: '#fff',
            strokeColor: 'red',
            radius: 2,
            cssClass: 'apexcharts-custom-class',
          },
          label: {
            borderColor: 'transparent',
            offsetY: 0,
            fontSize: '10px',
            style: {
              color: 'red',
              background: 'transparent',
            },

            text: 'a1 ' + n_data['a1'].reduce(aryMax).toString() + '℃',
          },
        },
        {
          x: n_data['time'][n_data['a2'].indexOf(n_data['a2'].reduce(aryMax))],
          y: n_data['a2'].reduce(aryMax),
          marker: {
            size: 4,
            fillColor: '#fff',
            strokeColor: 'red',
            radius: 2,
            cssClass: 'apexcharts-custom-class',
          },
          label: {
            borderColor: 'transparent',
            offsetY: 0,
            fontSize: '10px',
            style: {
              color: 'red',
              background: 'transparent',
            },

            text: 'a2 ' + n_data['a2'].reduce(aryMax).toString() + '℃',
          },
        },
        {
          x: n_data['time'][n_data['a3'].indexOf(n_data['a3'].reduce(aryMax))],
          y: n_data['a3'].reduce(aryMax),
          marker: {
            size: 4,
            fillColor: '#fff',
            strokeColor: 'red',
            radius: 2,
            cssClass: 'apexcharts-custom-class',
          },
          label: {
            borderColor: 'transparent',
            offsetY: 0,
            fontSize: '10px',
            style: {
              color: 'red',
              background: 'transparent',
            },

            text: 'a3 ' + n_data['a3'].reduce(aryMax).toString() + '℃',
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
      name: a0_location != 'None' ? 'a0 ' + a0_location : 'a0',
      data: n_data['a0'],
    },
    {
      name: a1_location != 'None' ? 'a1 ' + a1_location : 'a1',
      data: n_data['a1'],
    },
    {
      name: a2_location != 'None' ? 'a2 ' + a2_location : 'a2',
      data: n_data['a2'],
    },
    {
      name: a3_location != 'None' ? 'a3 ' + a3_location : 'a3',
      data: n_data['a3'],
    },
  ];

  return (
    <>
      <ApexChart type='line' options={option} series={series} height={height} />
    </>
  );
}
