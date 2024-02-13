import React, { useEffect, useState, useRef, useCallback } from 'react';

import { NextPage } from 'next';

// import local.jp.js
import AG_GRID_LOCALE_JP from '@/config/locale';

import { CalendarIcon, RepeatIcon, DragHandleIcon } from '@chakra-ui/icons';
import {
  Button,
  Grid,
  GridItem,
  SimpleGrid,
  Textarea,
  useDisclosure,
  Box,
  Text,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useToast,
  Flex,
  IconButton,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react';
import { ArrowPathIcon } from '@heroicons/react/20/solid';
import { ColDef } from 'ag-grid-community/dist/lib/entities/colDef';
import { AgGridReact } from 'ag-grid-react';
import initSqlJs from 'sql.js';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css'; // 任意のテーマを選択

import { AltitudeChart } from '@/components/altitudeChart';
import AppBar from '@/components/AppBar';
import GraphView from '@/components/GraphView';
import { HumidityChart } from '@/components/humidityChart';
import { PressureChart } from '@/components/pressureChart';
import { RawDataGrid } from '@/components/rawDataGrid';
import { TempChart } from '@/components/tempChart';

export interface tableData {
  id: number;
  baloon: string;
  weight: number;
  datetime: string;
  time: string;
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
}

const App: NextPage = () => {
  type Dataset = string;
  type DatasetRecord = {
    [rawdata: string]: Dataset;
  };
  const [rowData, setRowData] = useState<any[]>([]);
  const [oneData, setOneData] = useState<DatasetRecord>({});
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isFileOpened, setIsFileOpened] = useState(false);
  const [showRefreshIcon, setShowRefreshIcon] = useState(false);
  const [bufferCache, setBuffer] = useState<ArrayBufferLike | null>(null);
  const [view, setView] = useState<number>(0);
  const [accordionDefault, setAccordionDefault] = useState<any[]>([]);
  const [isSelected, setIsSelected] = useState<boolean>(false);

  const gridRef = useRef<AgGridReact<tableData[]>>(null);
  const toast = useToast();

  const handleFileOpen = async (selected: boolean) => {
    console.log(selected);
    let buffer = bufferCache;
    if (selected == false || bufferCache == null) {
      let files: FileSystemFileHandle[] = [];
      try {
        files = await window.showOpenFilePicker();
      } catch (error: any) {
        if (error.name.includes('SecurityError') || error.name.includes('TypeError')) {
          console.error('File System Access API でファイルを開けませんでした。エラー：', error);
          // File System Access API で開かなかった（従来の方法でファイルを開いた）場合
          setShowRefreshIcon(false); // 更新アイコンを非表示にする
          handleFileOpenWithoutAPI(); // 従来の方法でファイルの内容を取得する処理
          return;
        } else {
          console.error('File System Access API でファイルを開けませんでした。エラー：', error);
          toast({
            title: `ファイル選択がキャンセルされました。`,
            status: 'error',
            isClosable: true,
          });
          return;
        }
      }
      if (!files) {
        toast({
          title: `ファイルが選択されませんでした。`,
          description: '再度ファイルを選択してください',
          status: 'error',
          isClosable: true,
        });
        return;
      }
      const file = files[0];
      const fileHandle = await file.getFile();
      buffer = await fileHandle.arrayBuffer();
      setBuffer(await fileHandle.arrayBuffer());
    } else {
      buffer = bufferCache;
    }
    try {
      const SQL = await initSqlJs({
        locateFile: (file) => new URL('sql.js/dist/sql-wasm.wasm', import.meta.url).toString(),
      });
      const db = new SQL.Database(new Uint8Array(buffer));
      const res = db.exec('SELECT * FROM data');

      const fileData = res[0].values.map((row: any, index: number) => {
        console.log(row[3].split('_')[0]);
        return {
          id: index,
          baloon: row[1],
          weight: row[2],
          datetime: row[3].split('_')[0],
          time: row[3].split('_')[1].replace(/-/g, ':'),
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
      });

      console.log(fileData);

      // File System Access API で開いた場合
      setRowData(fileData);
      setIsFileOpened(true); // フラグを立てる

      // Appbarに更新アイコンボタンを表示する処理
      setShowRefreshIcon(true);
      toast({
        title: `データベースを読み込みました`,
        description: '更新ボタンを利用できます。',
        isClosable: true,
      });
    } catch (error) {
      console.error('File System Access API でファイルを開けませんでした。エラー：', error);
      // File System Access API で開かなかった（従来の方法でファイルを開いた）場合
      setShowRefreshIcon(false); // 更新アイコンを非表示にする
      handleFileOpenWithoutAPI(); // 従来の方法でファイルの内容を取得する処理
    }
  };

  // ファイルを開くボタンを押した後の処理
  const handleFileOpenWithoutAPI = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.db';
    input.onchange = async (event) => {
      const files = (event.target as HTMLInputElement).files;
      if (!files || files.length === 0) {
        console.error('No file selected');
        toast({
          title: `ファイルが選択されませんでした。`,
          status: 'error',
          isClosable: true,
        });
        return;
      }
      const file = files[0];
      const buffer = await file.arrayBuffer();
      const SQL = await initSqlJs({
        locateFile: (file) => new URL('sql.js/dist/sql-wasm.wasm', import.meta.url).toString(),
      });
      const db = new SQL.Database(new Uint8Array(buffer));
      const res = db.exec('SELECT * FROM data');

      const fileData = res[0].values.map((row: any, index: number) => {
        return {
          id: index,
          baloon: row[1],
          weight: row[2],
          datetime: row[3].split('_')[0],
          time: row[3].split('_')[1],
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
      });

      // 従来の方法でファイルの内容を取得し、画面に反映する処理
      setRowData(fileData);
      setIsFileOpened(true); // フラグを立てる

      // Appbarの更新アイコンボタンを非表示にする処理
      setShowRefreshIcon(false);
      toast({
        title: `データベースを読み込みました`,
        isClosable: true,
      });
    };

    input.click();
  };

  // 更新ボタンを押したときの処理
  const handleRefresh = async () => {
    if (isFileOpened) {
      // ファイルを再度読み取り、画面を更新する処理
      handleFileOpen(true);
    } else {
      // File System Access API でファイルを開いていない場合のエラーメッセージを表示する処理
      console.error(
        'File System Access API でファイルを開いていないため、更新できません。再度ファイルを選択してください',
      );
      toast({
        title: `更新エラー`,
        description:
          'File System Access API でファイルを開いていないため、更新できません。再度ファイルを選択してください',
        status: 'error',
        isClosable: true,
      });
    }
  };

  const changeView = () => {
    if (view == 0) {
      setView(1);
    } else {
      setView(0);
    }
    console.log('change view');
  };

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
    {
      field: 'id',
      cellDataType: 'number',
      headerName: '#',
      filter: 'agNumberColumnFilter',
      type: 'numericColumn',
      width: 30,
      pinned: 'left',
    },
    { field: 'baloon', cellDataType: 'text', headerName: '機体', pinned: 'left', width: 120 },
    { field: 'weight', headerName: '重量', cellDataType: 'number', pinned: 'left', width: 50 },
    { field: 'recordTime', headerName: '記録[s]' },
    { field: 'chargeTime', headerName: '充填[s]' },
    { field: 'airTime', headerName: '滞空[s]' },
    { field: 'temperature_ave', headerName: '温度[℃]' },
    { field: 'a_ave_init', headerName: '内部(離陸時)[℃]' },
    { field: 'pressure_init', headerName: '気圧[hPa]' },
    { field: 'humidity_init', headerName: '湿度[%]' },
    { field: 'altitude_max', headerName: '最大高度[m]' },
    { field: 'a0_max', headerName: 'A0max' },
    { field: 'a1_max', headerName: 'A1max' },
    { field: 'a2_max', headerName: 'A2max' },
    { field: 'a3_max', headerName: 'A3max' },
    {
      field: 'datetime',
      cellDataType: 'dateString',
      filter: 'agDateColumnFilter',
      headerName: '日付',
      minWidth: 150,
    },
    { field: 'time', headerName: '時刻', width: 600 },
    { field: 'rawdata', hide: true },
  ]);
  const [gridApi, setGridApi] = useState<any>(null);
  // const [a, setA] = useState(false);

  // const clearPinned = () => {
  //   setA(true);
  // };

  // //grid api を使う
  // useEffect(() => {
  //   if (gridApi) {
  //     gridApi.api.applyColumnState({ defaultState: { pinned: null } });
  //   }
  // }, [a, gridApi]);

  const Sidebar = () => {
    if (isSelected == true) {
      return (
        <>
          <Box>
            <GraphView
              oneData={oneData}
              data={oneData['rawdata']}
              recordTime={oneData['recordTime']}
              airTime={oneData['airTime']}
              chargeTime={oneData['chargeTime']}
            />
          </Box>
          <Accordion defaultIndex={accordionDefault} allowMultiple>
            <AccordionItem>
              <h2>
                <AccordionButton
                // onChange={(id) => {
                //   if (accordionDefault.includes(id)) {
                //     setAccordionDefault(accordionDefault.filter((item) => item !== id));
                //   } else {
                //     //配列にidを追加
                //     setAccordionDefault([...accordionDefault, id]);
                //   }
                // }}
                >
                  <Box as='span' flex='1' textAlign='left' className='ud-medium'>
                    温度 Temperature
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4}>
                <TempChart
                  data={oneData['rawdata']}
                  recordTime={oneData['recordTime']}
                  airTime={oneData['airTime']}
                  chargeTime={oneData['chargeTime']}
                  height={250}
                />
              </AccordionPanel>
            </AccordionItem>
            <AccordionItem>
              <h2>
                <AccordionButton>
                  <Box as='span' flex='1' textAlign='left' className='ud-medium'>
                    高度 Altitude
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4}>
                <AltitudeChart
                  data={oneData['rawdata']}
                  recordTime={oneData['recordTime']}
                  airTime={oneData['airTime']}
                  chargeTime={oneData['chargeTime']}
                  height={250}
                />
              </AccordionPanel>
            </AccordionItem>
            <AccordionItem>
              <h2>
                <AccordionButton>
                  <Box as='span' flex='1' textAlign='left' className='ud-medium'>
                    湿度 Humidity
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4}>
                <HumidityChart
                  data={oneData['rawdata']}
                  recordTime={oneData['recordTime']}
                  airTime={oneData['airTime']}
                  chargeTime={oneData['chargeTime']}
                  height={250}
                />
              </AccordionPanel>
            </AccordionItem>
            <AccordionItem>
              <h2>
                <AccordionButton>
                  <Box as='span' flex='1' textAlign='left' className='ud-medium'>
                    気圧 Pressure
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4}>
                <PressureChart
                  data={oneData['rawdata']}
                  recordTime={oneData['recordTime']}
                  airTime={oneData['airTime']}
                  chargeTime={oneData['chargeTime']}
                  height={250}
                />
              </AccordionPanel>
            </AccordionItem>
            <AccordionItem>
              <h2>
                <AccordionButton>
                  <Box as='span' flex='1' textAlign='left' className='ud-medium'>
                    生データ(CSV)
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4}>
                <Textarea
                  defaultValue={oneData['rawdata']}
                  placeholder='raw data'
                  height='350px'
                  resize='none'
                />
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </>
      );
    } else {
      return (
        <Box
          h='100%'
          bg='#f5f5f5'
          alignContent='center'
          alignItems='center'
          display='flex'
          justifyContent='center'
          verticalAlign='center'
          style={{ height: '100vh' }}
          className='ud-medium'
        >
          <Text className='ud-medium' align='center'>
            データを選択してください
          </Text>
        </Box>
      );
    }
  };

  return (
    <>
      <Box h='100%' style={{ height: '100vh', overflow: 'clip' }}>
        <AppBar>
          <Flex alignItems='center'>
            <IconButton
              icon={<CalendarIcon />}
              aria-label='change view'
              onClick={changeView}
              bg='transparent'
            />
            <IconButton
              icon={<RepeatIcon />}
              aria-label='Refresh'
              onClick={handleRefresh}
              display={showRefreshIcon ? 'block' : 'none'} // 更新アイコンの表示制御
              bg='transparent'
            />
            {/* <IconButton
              icon={<DragHandleIcon />}
              aria-label='ピン留めリセット'
              onClick={clearPinned}
              bg='transparent'
            /> */}
            <Button as='span' onClick={() => handleFileOpen(false)} ml={4}>
              Open
            </Button>
          </Flex>
        </AppBar>
        <Box p={{ top: 0, right: 4, left: 4 }} zIndex='base' h='100%' style={{ overflow: 'auto' }}>
          {view == 1 ? (
            <Grid gap={0}>
              <GridItem rowSpan={1}>
                <Box className='ag-theme-quartz' style={{ height: '430px', width: '100%' }}>
                  <AgGridReact
                    // gridApiを設定
                    onGridReady={(params) => {
                      setGridApi(params.api);
                    }}
                    rowData={rowData}
                    localeText={AG_GRID_LOCALE_JP}
                    columnDefs={colDefs}
                    defaultColDef={{
                      resizable: true,
                      filter: true,
                      sortable: true,
                      minWidth: 100,
                      floatingFilter: true,
                    }}
                    rowGroupPanelShow='always'
                    pivotPanelShow='always'
                    onRowClicked={(params: any) => {
                      setIsSelected(true);
                      setOneData(params.data);
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
                <SimpleGrid columns={[1, null, 4]} spacing='10px'>
                  <TempChart
                    data={oneData['rawdata']}
                    recordTime={oneData['recordTime']}
                    airTime={oneData['airTime']}
                    chargeTime={oneData['chargeTime']}
                  />
                  <AltitudeChart
                    data={oneData['rawdata']}
                    recordTime={oneData['recordTime']}
                    airTime={oneData['airTime']}
                    chargeTime={oneData['chargeTime']}
                  />
                  <HumidityChart
                    data={oneData['rawdata']}
                    recordTime={oneData['recordTime']}
                    airTime={oneData['airTime']}
                    chargeTime={oneData['chargeTime']}
                  />
                  <PressureChart
                    data={oneData['rawdata']}
                    recordTime={oneData['recordTime']}
                    airTime={oneData['airTime']}
                    chargeTime={oneData['chargeTime']}
                  />
                </SimpleGrid>
              </GridItem>
            </Grid>
          ) : (
            <Grid gap={0} templateColumns='3fr 1fr' h='100%' style={{ height: '100%' }}>
              <GridItem rowSpan={2}>
                <Box className='ag-theme-quartz' h='92%'>
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
                    onRowClicked={(params: any) => {
                      setOneData(params.data);
                      setIsSelected(true);
                      console.log(params.data);
                      // onOpen();
                    }}
                    pagination={true}
                    paginationPageSize={500}
                    rowHeight={40}
                  />
                </Box>
              </GridItem>
              <GridItem rowSpan={1} h='94%' style={{ overflow: 'auto' }}>
                <Sidebar />
              </GridItem>
            </Grid>
          )}
          <Drawer onClose={onClose} isOpen={isOpen} size='xl'>
            <DrawerOverlay />
            <DrawerContent>
              <DrawerCloseButton />
              <DrawerHeader>{`${oneData['id']} のデータ`}</DrawerHeader>
              <DrawerBody>
                <Text>{oneData['rawdata']}</Text>
              </DrawerBody>
            </DrawerContent>
          </Drawer>
        </Box>
      </Box>
    </>
  );
};

export default App;
