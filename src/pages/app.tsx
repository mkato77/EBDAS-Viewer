import React, { useState } from 'react';
import { Button, Grid, GridItem, SimpleGrid, Textarea, useDisclosure } from '@chakra-ui/react';
import { Box, Text ,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
} from '@chakra-ui/react';
import { AgGridReact } from 'ag-grid-react';
import { ICellRendererComp, ICellRendererParams, RowClickedEvent } from 'ag-grid-community';
import initSqlJs from 'sql.js'
import { ColDef } from 'ag-grid-community/dist/lib/entities/colDef';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css'; // 任意のテーマを選択
// import local.jp.js
import AG_GRID_LOCALE_JP from '@/config/locale';
import { Dictionary, List } from 'lodash';
import AppBar from '@/components/AppBar';
import { TempChart } from '@/components/tempChart';
import { NextPage } from 'next';

const App: NextPage = () => {
  type Dataset = string;
  type DatasetRecord = {
    [rawdata: string]: Dataset;
  }
  const [rowData, setRowData] = useState<any[]>([]);
  const [oneData, setOneData] = useState<DatasetRecord>({});
  const { isOpen, onOpen, onClose } = useDisclosure()
  /*
type dataRow = {
    id: number;
    baloon: string;
    weight: number;
    datetime: string;
    recordTime: number;
    chargeTime: number;
    airTime: number;
    temperature_ave: number;
    pressure_init: number;
    humidity_init: number;
    altitude_max: number;
    a_ave_init: number;
    a0_max: number;
    a1_max: number;
    a2_max: number;
    a3_max: number;
    rawdata: string;

  };

  */

  const [colDefs, setColDefs] = useState<ColDef[]>([
    { field: 'id', cellDataType: 'number', headerName: '#', filter:"agNumberColumnFilter", type: 'numericColumn', width: 30, pinned: 'left'},
    { field: 'baloon', cellDataType: "text", headerName: "機体", pinned: 'left' , width: 120},
    { field: 'weight', headerName: "重量", cellDataType: 'number', pinned: 'left', width: 50},
    { field: 'recordTime', headerName: "記録[s]" },
    { field: 'chargeTime', headerName: "充電[s]" },
    { field: 'airTime', headerName: "滞空[s]" },
    { field: 'temperature_ave', headerName: "温度[℃]" },
    { field: 'pressure_init', headerName: "気圧[hPa]" },
    { field: 'humidity_init', headerName: "湿度[%]" },
    { field: 'altitude_max', headerName: "最大高度[m]" },
    { field: 'a_ave_init', headerName: "内部(離陸時)[℃]" },
    { field: 'a0_max', headerName: "A0max" },
    { field: 'a1_max', headerName: "A1max" },
    { field: 'a2_max', headerName: "A2max" },
    { field: 'a3_max', headerName: "A3max" },
    { field: 'datetime', headerName: "日時", width:300 },
    { field: 'rawdata', hide: true, type: 'string'},
  ]);
  const [gridApi, setGridApi] = useState<any>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      console.error('No file selected');
      return;
    }
    const file = files[0];
    const buffer = await file.arrayBuffer();
    // ファイルからデータを取得して rowData ステートに設定する処理を行う
    // ここでは仮のデータをセットしている
    //@ts-ignore
    initSqlJs({
      locateFile: (file) => (new URL("sql.js/dist/sql-wasm.wasm", import.meta.url)).toString(),
    }).then((SQL) => {
      const db = new SQL.Database(new Uint8Array(buffer));
      let res = db.exec('SELECT * FROM data');
      setRowData(
        res[0].values.map((row: any, index: number) => {
          return {
            id: index,
            baloon: row[1],
            weight: row[2],
            datetime: row[3],
            recordTime: row[4],
            chargeTime: row[5],
            airTime: row[6],
            temperature_ave: row[7],
            pressure_init: row[8],
            humidity_init: row[9],
            altitude_max: row[10],
            a_ave_init: row[11],
            a0_max: row[12],
            a1_max: row[13],
            a2_max: row[14],
            a3_max: row[15],
            rawdata: row[16],
          };
        }),
      );
      console.log(res[0].values);
    });
  };

  return (
    <>
    <AppBar>
      <label htmlFor="file-input">
        <Button as="span">
          Open
        </Button>
      <input id="file-input" type="file" accept=".db" onChange={handleFileChange} style={{ display: 'none' }} />
      </label>
    </AppBar>
    <Box p={{top:0, right:4, left:4}} zIndex="base" style={{height: "100%"}}>
      <Grid  gap={0}>
      <GridItem rowSpan={1}>
      <Box mt={14} className='ag-theme-quartz' style={{ height: '430px', width: '100%' }}>

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
            floatingFilter:true
          }}
          rowGroupPanelShow="always"
          pivotPanelShow="always"
          onRowClicked={(params: RowClickedEvent) => {
            setOneData(params.data as Dictionary<any>);
            console.log(params.data);
            // onOpen();
          }}
          pagination={true}
          paginationPageSize={500}
          rowHeight={40}
        />
      </Box>
      </GridItem>
      <GridItem rowSpan={1}>
      <SimpleGrid columns={[2, null, 3]} spacing='10px'>
        <Textarea value={oneData["rawdata"]} placeholder='raw data' height="350px"/>
        <TempChart data={oneData["rawdata"]} recordTime={oneData["recordTime"]} airTime={oneData["airTime"]} chargeTime={oneData["chargeTime"]}/>
      </SimpleGrid>
      </GridItem>
      </Grid>
      <Drawer onClose={onClose} isOpen={isOpen} size="xl">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>{`${oneData["id"]} のデータ`}</DrawerHeader>
          <DrawerBody>
            <Text>{oneData["rawdata"]}</Text>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
    </>
  );
};

export default App;
