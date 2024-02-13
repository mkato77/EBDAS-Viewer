// charts.tsx/jsx

'use client'; // if you use app dir, don't forget this line

import { useEffect, useState } from 'react';

import AG_GRID_LOCALE_JP from '@/config/locale';

import { Box } from '@chakra-ui/react';
import { ColDef } from 'ag-grid-community/dist/lib/entities/colDef';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css'; // 任意のテーマを選択

interface SensorData {
  time: number | null;
  temperature: number | null;
  pressure: number | null;
  humidity: number | null;
  altitude: number | null;
  a0: number | null;
  a1: number | null;
  a2: number | null;
  a3: number | null;
}

function parseData(data: string) {
  console.log(data);
  const lines = data.trim().split('\n');
  const keys = lines[0].split(',').map((key) => key.trim());

  const rData = [];

  for (let i = 1; i < lines.length; i++) {
    const sensorData: SensorData = {
      time: null,
      temperature: null,
      pressure: null,
      humidity: null,
      altitude: null,
      a0: null,
      a1: null,
      a2: null,
      a3: null,
    };

    const values = lines[i].split(',').map((value) => parseFloat(value.trim()));
    sensorData.time = values[0];
    sensorData.temperature = values[1];
    sensorData.pressure = values[2];
    sensorData.humidity = values[3];
    sensorData.altitude = values[4];
    sensorData.a0 = values[5];
    sensorData.a1 = values[6];
    sensorData.a2 = values[7];
    sensorData.a3 = values[8];
    rData.push(sensorData);
  }

  return rData;
}
const aryMax = function (a: number, b: number) {
  return Math.max(a, b);
};
const aryMin = function (a: number, b: number) {
  return Math.min(a, b);
};

export function RawDataGrid({
  data,
  recordTime,
  chargeTime,
  airTime,
  height,
}: {
  data: string;
  recordTime: string;
  chargeTime: string;
  airTime: string;
  height?: number | undefined;
}) {
  const [colDefs, setColDefs] = useState<ColDef[]>([
    {
      field: 'time',
      cellDataType: 'number',
      headerName: '時間[s]',
      filter: 'agNumberColumnFilter',
      type: 'numericColumn',
      width: 30,
      pinned: 'left',
    },
    { field: 'temperature', headerName: '温度[℃]' },
    { field: 'pressure', headerName: '気圧[hPa]' },
    { field: 'humidity', headerName: '湿度[%]' },
    { field: 'altitude', headerName: '高度[m]' },
    { field: 'a0', headerName: 'a0[℃]' },
    { field: 'a1', headerName: 'a1[℃]' },
    { field: 'a2', headerName: 'a2[℃]' },
    { field: 'a3', headerName: 'a3[℃]' },
  ]);
  const [rowData, setRowData] = useState<any[]>([]);
  const [gridApi, setGridApi] = useState<any>(null);

  useEffect(() => {
    if (!data) {
      return;
    }

    const n_data = parseData(data);
    setRowData(n_data);
  }, [data]);

  return (
    <>
      <Box className='ag-theme-quartz' h='100%'>
        <AgGridReact
          rowData={rowData}
          localeText={AG_GRID_LOCALE_JP}
          columnDefs={colDefs}
          defaultColDef={{
            resizable: true,
            filter: true,
            sortable: true,
            flex: 1,
            minWidth: 100,
            floatingFilter: true,
          }}
          rowGroupPanelShow='always'
          pivotPanelShow='always'
          pagination={true}
          paginationPageSize={500}
          rowHeight={40}
        />
      </Box>
    </>
  );
}
