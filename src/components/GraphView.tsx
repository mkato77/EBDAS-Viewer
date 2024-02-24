// AppBar.tsx

import React, { ReactNode, useState } from 'react';

import {
  Box,
  Flex,
  Image,
  Text,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Button,
  Badge,
  Textarea,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  StatGroup,
} from '@chakra-ui/react';

import { TempChart } from '@/components/tempChart';

import { AltitudeChart } from './altitudeChart';
import { HumidityChart } from './humidityChart';
import { PressureChart } from './pressureChart';
import { RawDataGrid } from './rawDataGrid';
type Dataset = string;
type DatasetRecord = {
  [rawdata: string]: Dataset;
};
interface Props {
  data: string;
  recordTime: string;
  airTime: string;
  actualAirTime: string;
  chargeTime: string;
  oneData: DatasetRecord;
}

const GraphView: React.FC<Props> = ({
  oneData,
  data,
  recordTime,
  airTime,
  chargeTime,
  actualAirTime,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  /*
      time: [],
    temperature: [],
    pressure: [],
    humidity: [],
    altitude: [],
    a0: [],
    a1: [],
    a2: [],
    a3: [],
    */

  return (
    <>
      {isOpen ? (
        <Modal onClose={onClose} size='full' isOpen={isOpen}>
          <ModalOverlay />
          <ModalContent h='100%'>
            <ModalHeader>
              <Box alignItems='center' display='flex' className='ud-bold'>
                <Badge mr='2' fontSize='1em' colorScheme='blue'>
                  {`#${oneData['id']}`}
                </Badge>
                {`${oneData['baloon']} ${oneData['weight']}g`}
                {actualAirTime ? (
                  <Text fontSize={16} pl={4} className='ud-medium'>
                    充填: {chargeTime}s / 滞空: {actualAirTime}s
                  </Text>
                ) : (
                  <Text fontSize={16} pl={4} className='ud-medium'>
                    充填: {chargeTime}s / 滞空(旧): {airTime}s
                  </Text>
                )}
              </Box>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody h='100%' style={{ overflow: 'clip' }}>
              <Tabs h='100%' style={{ overflow: 'clip' }}>
                <TabList className='ud-bold'>
                  <Tab className='ud-medium'>データ</Tab>
                  <Tab className='ud-medium'>外気温度・内部温度</Tab>
                  <Tab className='ud-medium'>高度</Tab>
                  <Tab className='ud-medium'>湿度</Tab>
                  <Tab className='ud-medium'>気圧</Tab>
                  <Tab className='ud-medium'>記録メモ</Tab>
                  <Tab className='ud-medium'>生データ(CSV)</Tab>
                </TabList>

                <TabPanels h='100%' style={{ overflow: 'auto' }}>
                  <TabPanel h='93%' style={{ overflow: 'auto' }}>
                    <RawDataGrid
                      data={data}
                      recordTime={recordTime}
                      airTime={airTime}
                      chargeTime={chargeTime}
                    />
                  </TabPanel>
                  <TabPanel h='93%' style={{ overflow: 'auto' }}>
                    <TempChart
                      data={oneData['rawdata']}
                      recordTime={oneData['recordTime']}
                      airTime={oneData['airTime']}
                      chargeTime={oneData['chargeTime']}
                      a0_location={oneData['a0_location']}
                      a1_location={oneData['a1_location']}
                      a2_location={oneData['a2_location']}
                      a3_location={oneData['a3_location']}
                      showLavel={true}
                      height={520}
                    />
                  </TabPanel>
                  <TabPanel>
                    <AltitudeChart
                      data={data}
                      recordTime={recordTime}
                      airTime={airTime}
                      chargeTime={chargeTime}
                      height={520}
                    />
                  </TabPanel>
                  <TabPanel>
                    <HumidityChart
                      data={data}
                      recordTime={recordTime}
                      airTime={airTime}
                      chargeTime={chargeTime}
                      height={520}
                    />
                  </TabPanel>
                  <TabPanel>
                    <PressureChart
                      data={data}
                      recordTime={recordTime}
                      airTime={airTime}
                      chargeTime={chargeTime}
                      height={520}
                    />
                  </TabPanel>
                  <TabPanel h='93%' style={{ overflow: 'auto' }}>
                    {oneData['recordNote'] ? (
                      <Text h='100%' className='ud' style={{ whiteSpace: 'pre-wrap' }}>
                        {oneData['recordNote']}
                      </Text>
                    ) : (
                      <Text h='100%' className='ud-medium'>
                        ノートなし
                      </Text>
                    )}
                  </TabPanel>
                  <TabPanel h='93%' style={{ overflow: 'auto' }}>
                    <Textarea
                      resize='none'
                      defaultValue={oneData['rawdata']}
                      placeholder='raw data'
                      h='100%'
                    />
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </ModalBody>
          </ModalContent>
        </Modal>
      ) : (
        <>
          <Box mt={2} pr={2} alignItems='center' display='flex'>
            <Flex align='space-between' justify='space-between' w='100%' alignItems='center'>
              <Text pl={4} fontSize='md' className='ud-bold'>
                <Box alignItems='center' display='flex'>
                  <Badge mr='2' fontSize='1em' colorScheme='blue'>
                    {`#${oneData['id']}`}
                  </Badge>
                  {`${oneData['baloon']} ${oneData['weight']}g`}
                </Box>
              </Text>
              <Button onClick={onOpen} size='sm' ml={4} className='ud-medium'>
                全画面表示
              </Button>
            </Flex>
          </Box>
          {actualAirTime ? (
            <Text fontSize={16} pl={4} className='ud-medium'>
              充填: {chargeTime}s / 滞空: {actualAirTime}s
            </Text>
          ) : (
            <Text fontSize={16} pl={4} className='ud-medium'>
              充填: {chargeTime}s / 滞空(旧): {airTime}s
            </Text>
          )}
        </>
      )}
    </>
  );
};

export default GraphView;
