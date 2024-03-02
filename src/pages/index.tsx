import React, { useEffect, useState, useRef, useCallback } from 'react';

import { NextPage } from 'next';

// import local.jp.js
import AG_GRID_LOCALE_JP from '@/config/locale';

import {
  CalendarIcon,
  RepeatIcon,
  DragHandleIcon,
  CopyIcon,
  DeleteIcon,
  Search2Icon,
} from '@chakra-ui/icons';
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
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
  Tooltip,
  Spinner,
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
  recordLocation: string;
  actualAirTime: number;
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
  a0_location: string;
  a1_location: string;
  a2_location: string;
  a3_location: string;
  rawdata: string;
  recordNote: string;
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
  const [view, setView] = useState<number>(2);
  const [accordionDefault, setAccordionDefault] = useState<any[]>([]);
  const [isSelected, setIsSelected] = useState<boolean>(false);
  const [directoryHandle, setDirectoryHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const gridRef = useRef<AgGridReact<tableData[]>>(null);
  const toast = useToast();
  const [isFileLoading, setIsFileLoading] = useState(false);

  const handleFileOpen = async (selected: boolean) => {
    // console.log(selected);
    // let buffer = bufferCache;
    let dicHnd = directoryHandle;
    if (selected == false || dicHnd == null) {
      // let files: FileSystemFileHandle[] = [];
      try {
        dicHnd = await window.showDirectoryPicker();
        setDirectoryHandle(dicHnd);
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
          setIsFileLoading(false);
          return;
        }
      }
      // if (!files) {
      //   toast({
      //     title: `ファイルが選択されませんでした。`,
      //     description: '再度ファイルを選択してください',
      //     status: 'error',
      //     isClosable: true,
      //   });
      //   return;
      // }
    } else {
      // buffer = bufferCache;
    }
    setIsFileLoading(true);
    try {
      if (dicHnd == null) {
        return;
      }
      // EBDAS_data.dbファイルを開く
      const fileHandle = await dicHnd.getFileHandle('EBDAS_data.db');
      const file = await fileHandle.getFile();
      const buffer = await file.arrayBuffer();
      const SQL = await initSqlJs({
        locateFile: (file) => new URL('sql.js/dist/sql-wasm.wasm', import.meta.url).toString(),
      });
      const db = new SQL.Database(new Uint8Array(buffer));
      const res = db.exec('SELECT * FROM data');

      const fileData = res[0].values.map((row: any, index: number) => {
        // console.log(row[3].split('_')[0]);
        return {
          boolean: false,
          id: row[0],
          baloon: row[1],
          weight: row[2],
          datetime: row[3].split('_')[0],
          time: row[3].split('_')[1].replace(/-/g, ':'),
          recordLocation: row[4],
          recordTime: row[5],
          chargeTime: row[6],
          airTime: row[7],
          actualAirTime: row[8],
          temperature_ave: row[9],
          pressure_init: row[10],
          humidity_init: row[11],
          altitude_max: row[12],
          a_ave_init: row[13],
          a0_max: row[14],
          a1_max: row[15],
          a2_max: row[16],
          a3_max: row[17],
          a0_location: row[18],
          a1_location: row[19],
          a2_location: row[20],
          a3_location: row[21],
          rawdata: row[22],
          recordNote: row[23],
        };
      });

      // console.log(fileData);

      // File System Access API で開いた場合
      setRowData(fileData);
      setIsFileOpened(true); // フラグを立てる

      // Appbarに更新アイコンボタンを表示する処理
      setShowRefreshIcon(true);
      setIsFileLoading(false);
      if (selected) {
        toast({
          title: `データベースを読み込みました`,
          isClosable: true,
        });
      } else {
        toast({
          title: `データベースを読み込みました`,
          description: '更新ボタンを利用できます。',
          isClosable: true,
        });
      }
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
      setIsFileLoading(true);
      const file = files[0];
      const buffer = await file.arrayBuffer();
      const SQL = await initSqlJs({
        locateFile: (file) => new URL('sql.js/dist/sql-wasm.wasm', import.meta.url).toString(),
      });
      const db = new SQL.Database(new Uint8Array(buffer));
      const res = db.exec('SELECT * FROM data');

      const fileData = res[0].values.map((row: any, index: number) => {
        return {
          boolean: false,
          id: row[0],
          baloon: row[1],
          weight: row[2],
          datetime: row[3].split('_')[0],
          time: row[3].split('_')[1].replace(/-/g, ':'),
          recordLocation: row[4],
          recordTime: row[5],
          chargeTime: row[6],
          airTime: row[7],
          actualAirTime: row[8],
          temperature_ave: row[9],
          pressure_init: row[10],
          humidity_init: row[11],
          altitude_max: row[12],
          a_ave_init: row[13],
          a0_max: row[14],
          a1_max: row[15],
          a2_max: row[16],
          a3_max: row[17],
          a0_location: row[18],
          a1_location: row[19],
          a2_location: row[20],
          a3_location: row[21],
          rawdata: row[22],
          recordNote: row[23],
        };
      });

      // 従来の方法でファイルの内容を取得し、画面に反映する処理
      setRowData(fileData);
      setIsFileOpened(true); // フラグを立てる

      // Appbarの更新アイコンボタンを非表示にする処理
      setShowRefreshIcon(false);
      setIsFileLoading(false);
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
      // console.log('handle');
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
    setView((prev) => (prev + 1) % 3);
    // console.log('change view');
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
      headerName: '',
      field: 'boolean',
      cellEditor: 'agCheckboxCellEditor',
      width: 60,
      pinned: 'left',
      editable: true,
      minWidth: 60,
      type: 'rightAligned',
    },
    {
      field: 'id',
      cellDataType: 'number',
      headerName: '#',
      filter: 'agNumberColumnFilter',
      type: 'numericColumn',
      width: 80,
      pinned: 'left',
      minWidth: 80,
    },
    {
      field: 'baloon',
      cellDataType: 'text',
      headerName: '機体',
      pinned: 'left',
      width: 130,
      minWidth: 130,
    },
    { field: 'weight', headerName: '重量', cellDataType: 'number', pinned: 'left', width: 50 },
    {
      field: 'datetime',
      cellDataType: 'dateString',
      filter: 'agDateColumnFilter',
      headerName: '日付',
      minWidth: 105,
    },
    { field: 'time', headerName: '時刻', width: 90, minWidth: 90 },
    { field: 'recordLocation', headerName: '記録地点', minWidth: 140 },
    { field: 'chargeTime', headerName: '充填[s]', minWidth: 90 },
    { field: 'airTime', headerName: '滞空[s]', minWidth: 90 },
    { field: 'actualAirTime', headerName: 'A滞空[s]', minWidth: 90 },
    { field: 'temperature_ave', headerName: '温度[℃]', minWidth: 90 },
    { field: 'pressure_init', headerName: '気圧[hPa]', minWidth: 90 },
    { field: 'humidity_init', headerName: '湿度[%]', minWidth: 90 },
    { field: 'altitude_max', headerName: '最大高度[m]', minWidth: 90 },
    { field: 'a0_max', headerName: 'A0max', minWidth: 90 },
    { field: 'a1_max', headerName: 'A1max', minWidth: 90 },
    { field: 'a2_max', headerName: 'A2max', minWidth: 90 },
    { field: 'a3_max', headerName: 'A3max', minWidth: 90 },
    { field: 'a0_location', headerName: 'A0loc', minWidth: 90 },
    { field: 'a1_location', headerName: 'A1loc', minWidth: 90 },
    { field: 'a2_location', headerName: 'A2loc', minWidth: 90 },
    { field: 'a3_location', headerName: 'A3loc', minWidth: 90 },
    { field: 'rawdata', hide: true },
    { field: 'recordNote', headerName: 'メモ', minWidth: 300 },
    { field: 'a_ave_init', headerName: '内部(離陸時)[℃]' },
    { field: 'recordTime', headerName: '記録[s]' },
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
              actualAirTime={oneData['actualAirTime']}
            />
          </Box>
          <Accordion
            defaultIndex={oneData['recordNote'] ? [0, 2, 3, 4, 5] : [1, 2, 3, 4]}
            allowMultiple
          >
            {oneData['recordNote'] ? (
              <AccordionItem>
                <h2>
                  <AccordionButton>
                    <Box as='span' flex='1' textAlign='left' className='ud-medium'>
                      記録メモ
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                  <Text className='ud' style={{ whiteSpace: 'pre-wrap' }} fontSize='sm'>
                    {oneData['recordNote']}
                  </Text>
                </AccordionPanel>
              </AccordionItem>
            ) : (
              <></>
            )}
            <AccordionItem>
              <h2>
                <AccordionButton>
                  <Box as='span' flex='1' textAlign='left' className='ud-medium'>
                    情報 Information
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4}>
                {/* chakra Tableで各種情報表示 */}
                <TableContainer>
                  <Table size='sm'>
                    {/* <Thead>
                      <Tr>
                        <Th>To convert</Th>
                        <Th>into</Th>
                        <Th isNumeric>multiply by</Th>
                      </Tr>
                    </Thead> */}
                    <Tbody>
                      <Tr>
                        <Td>記録日時</Td>
                        <Td>
                          {oneData['datetime'].replaceAll('-', '/')} {oneData['time']}
                        </Td>
                      </Tr>
                      <Tr>
                        <Td>記録場所</Td>
                        <Td>{oneData['recordLocation']}</Td>
                      </Tr>
                      <Tr>
                        <Td>a0</Td>
                        <Td>{oneData['a0_location']}</Td>
                      </Tr>
                      <Tr>
                        <Td>a1</Td>
                        <Td>{oneData['a1_location']}</Td>
                      </Tr>
                      <Tr>
                        <Td>a2</Td>
                        <Td>{oneData['a2_location']}</Td>
                      </Tr>
                      <Tr>
                        <Td>a3</Td>
                        <Td>{oneData['a3_location']}</Td>
                      </Tr>
                    </Tbody>
                  </Table>
                </TableContainer>
              </AccordionPanel>
            </AccordionItem>
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
                  a0_location={oneData['a0_location']}
                  a1_location={oneData['a1_location']}
                  a2_location={oneData['a2_location']}
                  a3_location={oneData['a3_location']}
                  height={300}
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
                    データ Data
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel h={450} pb={4}>
                <RawDataGrid
                  data={oneData['rawdata']}
                  recordTime={oneData['recordTime']}
                  airTime={oneData['airTime']}
                  chargeTime={oneData['chargeTime']}
                  height={300}
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

  const [count, setCount] = useState(0);
  const [isFilterOn, setIsFilterOn] = useState(false);

  return (
    <>
      <Box h='100%' style={{ height: '100vh', overflow: 'clip' }}>
        <AppBar>
          <Flex alignItems='center'>
            {isFileOpened && count > 0 ? (
              <>
                {/* ag-grid の external フィルター：booleanがtrueの列のみ */}
                {!isFilterOn ? (
                  <Button
                    onClick={() => {
                      console.log('filter');
                      console.log(gridApi.getFilterModel());
                      const currentFilterModel = gridApi.getFilterModel();
                      const newFilterModel = {
                        ...currentFilterModel,
                        boolean: { filterType: 'text', type: 'true', filter: 'false' },
                      };
                      gridApi.setFilterModel(newFilterModel);
                      setIsFilterOn(true);
                      // toast({
                      //   title: 'フィルタを適用しました',
                      //   status: 'info',
                      //   isClosable: true,
                      // });
                    }}
                    leftIcon={<Search2Icon />}
                    colorScheme='blue'
                    variant='ghost'
                    mr={2}
                    className='ud-medium'
                  >
                    フィルタ
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      interface FilterModel {
                        [key: string]: any; // フィルターモデルのプロパティの型
                      }

                      console.log('filter');
                      console.log(gridApi.getFilterModel());
                      const currentFilterModel = gridApi.getFilterModel();
                      const newFilterModel = Object.keys(currentFilterModel).reduce(
                        (acc: FilterModel, key: string) => {
                          if (key !== 'boolean') {
                            acc[key] = currentFilterModel[key];
                          }
                          return acc;
                        },
                        {},
                      );
                      gridApi.setFilterModel(newFilterModel);
                      setIsFilterOn(false);
                    }}
                    colorScheme='red'
                    variant='outline'
                    mr={2}
                    className='ud-medium'
                  >
                    フィルタ解除
                  </Button>
                )}

                <Button
                  className='ud-medium'
                  onClick={() => {
                    const selectedRows: number[] = [];
                    let allRowNodes: any = [];
                    gridApi.forEachNode((node: any) => allRowNodes.push(node.data));
                    console.log(allRowNodes);
                    let count: number = 0;
                    allRowNodes.forEach((rowNode: any) => {
                      if (rowNode.boolean === true) {
                        selectedRows.push(rowNode.id);
                        count++;
                      }
                    });
                    if (count === 0) {
                      toast({
                        title: '行が選択されていません',
                        status: 'error',
                        isClosable: true,
                      });
                      return;
                    } else {
                      navigator.clipboard.writeText(selectedRows.join(','));
                      toast({
                        title: 'コピーしました',
                        status: 'success',
                        isClosable: true,
                      });
                    }
                  }}
                  colorScheme='teal'
                  variant='ghost'
                  leftIcon={<CopyIcon />}
                >
                  選択行番号コピー
                </Button>
                <Button
                  mr={6}
                  className='ud-medium'
                  onClick={() => {
                    const allRowNodes: any = [];
                    gridApi.forEachNode((node: any) => allRowNodes.push(node.data));
                    allRowNodes.forEach((rowNode: any) => {
                      if (rowNode.boolean === true) {
                        rowNode.boolean = false;
                      }
                    });
                    gridApi.refreshCells();
                    setCount(0);
                    toast({
                      title: '選択を解除しました',
                      status: 'info',
                      isClosable: true,
                    });
                  }}
                  leftIcon={<DeleteIcon />}
                  colorScheme='red'
                  variant='ghost'
                  ml={2}
                >
                  選択解除
                </Button>
              </>
            ) : (
              <></>
            )}

            <Spinner display={isFileLoading ? 'block' : 'none'} />
            <Tooltip label='表示レイアウトを変更' className='ud'>
              <IconButton
                icon={<CalendarIcon />}
                aria-label='change view'
                onClick={changeView}
                bg='transparent'
              />
            </Tooltip>
            <Tooltip label='データを更新' className='ud'>
              <IconButton
                icon={<RepeatIcon />}
                aria-label='Refresh'
                onClick={handleRefresh}
                display={showRefreshIcon ? 'block' : 'none'} // 更新アイコンの表示制御
                bg='transparent'
              />
            </Tooltip>
            {/* <IconButton
              icon={<DragHandleIcon />}
              aria-label='ピン留めリセット'
              onClick={clearPinned}
              bg='transparent'
            /> */}
            <Button
              as='span'
              onClick={() => handleFileOpen(false)}
              ml={4}
              // isLoading={isFileLoading}
              // loadingText='Loading...'
            >
              Open
            </Button>
          </Flex>
        </AppBar>
        <Box p={{ top: 0, right: 4, left: 4 }} zIndex='base' h='100%' style={{ overflow: 'auto' }}>
          {view == 0 ? (
            <Box h='100%' style={{ height: '100%' }}>
              <Box className='ag-theme-quartz' h='92%'>
                <AgGridReact
                  // gridApiを設定
                  onGridReady={(params) => {
                    setGridApi(params.api);
                  }}
                  onCellValueChanged={(params) => {
                    console.log(params);
                    // const selectedRows = gridApi.getSelectedRows();
                    const allRows = gridApi.getRenderedNodes().map((node: any) => node.data);
                    // const unselectedRows = allRows.filter(
                    //   (row: any) => !selectedRows.includes(row),
                    // );
                    const a = allRows.filter((row: any) => row.boolean === true).length;
                    setCount(a);
                    console.log(a);
                    // Perform the dynamic update here
                  }}
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
                    // console.log(params.data);
                    // onOpen();
                  }}
                  pagination={true}
                  paginationPageSize={500}
                  rowHeight={30}
                />
              </Box>
            </Box>
          ) : view == 1 ? (
            <Grid gap={0}>
              <GridItem rowSpan={1}>
                <Box className='ag-theme-quartz' style={{ height: '430px', width: '100%' }}>
                  <AgGridReact
                    // gridApiを設定
                    onGridReady={(params) => {
                      setGridApi(params.api);
                    }}
                    onCellValueChanged={(params) => {
                      console.log(params);
                      // const selectedRows = gridApi.getSelectedRows();
                      const allRows = gridApi.getRenderedNodes().map((node: any) => node.data);
                      // const unselectedRows = allRows.filter(
                      //   (row: any) => !selectedRows.includes(row),
                      // );
                      const a = allRows.filter((row: any) => row.boolean === true).length;
                      setCount(a);
                      console.log(a);
                      // Perform the dynamic update here
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
                      flex: 1,
                    }}
                    rowGroupPanelShow='always'
                    pivotPanelShow='always'
                    onRowClicked={(params: any) => {
                      setIsSelected(true);
                      setOneData(params.data);
                      // console.log(params.data);
                    }}
                    pagination={true}
                    paginationPageSize={500}
                    rowHeight={30}
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
                    a0_location={oneData['a0_location']}
                    a1_location={oneData['a1_location']}
                    a2_location={oneData['a2_location']}
                    a3_location={oneData['a3_location']}
                    height={250}
                  />
                  <AltitudeChart
                    data={oneData['rawdata']}
                    recordTime={oneData['recordTime']}
                    airTime={oneData['airTime']}
                    chargeTime={oneData['chargeTime']}
                    height={250}
                  />
                  <HumidityChart
                    data={oneData['rawdata']}
                    recordTime={oneData['recordTime']}
                    airTime={oneData['airTime']}
                    chargeTime={oneData['chargeTime']}
                    height={250}
                  />
                  <PressureChart
                    data={oneData['rawdata']}
                    recordTime={oneData['recordTime']}
                    airTime={oneData['airTime']}
                    chargeTime={oneData['chargeTime']}
                    height={250}
                  />
                </SimpleGrid>
              </GridItem>
            </Grid>
          ) : (
            <Grid gap={0} templateColumns='5fr 2fr' h='100%' style={{ height: '100%' }}>
              <GridItem rowSpan={2}>
                <Box className='ag-theme-quartz' h='92%'>
                  <AgGridReact
                    // gridApiを設定
                    onGridReady={(params) => {
                      setGridApi(params.api);
                    }}
                    onCellValueChanged={(params) => {
                      console.log(params);
                      // const selectedRows = gridApi.getSelectedRows();
                      const allRows = gridApi.getRenderedNodes().map((node: any) => node.data);
                      // const unselectedRows = allRows.filter(
                      //   (row: any) => !selectedRows.includes(row),
                      // );
                      const a = allRows.filter((row: any) => row.boolean === true).length;
                      setCount(a);
                      console.log(a);
                      // Perform the dynamic update here
                    }}
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
                      // console.log(params.data);
                      // onOpen();
                    }}
                    pagination={true}
                    paginationPageSize={500}
                    rowHeight={30}
                  />
                </Box>
              </GridItem>
              <GridItem rowSpan={1} h='94%' style={{ overflow: 'auto' }}>
                <Sidebar />
              </GridItem>
            </Grid>
          )}
          <Drawer onClose={onClose} isOpen={isOpen} size='md'>
            <DrawerOverlay />
            <DrawerContent>
              <DrawerCloseButton />
              {/* <DrawerHeader>{`${oneData['id']} のデータ`}</DrawerHeader> */}
              <DrawerBody>
                <Sidebar />
              </DrawerBody>
            </DrawerContent>
          </Drawer>
        </Box>
      </Box>
    </>
  );
};

export default App;
