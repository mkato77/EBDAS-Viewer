// AppBar.tsx

import React, { ReactNode } from 'react';

import { Box, Flex, Image, Text } from '@chakra-ui/react';

interface AppBarProps {
  children?: ReactNode;
}

const AppBar: React.FC<AppBarProps> = ({ children }) => {
  return (
    <Flex
      as='header'
      align='center'
      justify='space-between'
      //   borderBottom="1px"
      borderColor='gray.200'
      padding='0.1rem 1rem'
      boxShadow='md'
      zIndex={1000}
      position='relative'
      // position='fixed' // 上部に固定
      top='0' // 画面の上部に配置
      width='100%' // 横幅を100%に設定
      bg='white' // 背景色を白に設定
    >
      <Box alignItems='center' display='flex'>
        <Image src='./ebdas.png' alt='Logo' height='50px' />
        <Text fontSize='xl' fontWeight='bold' className='ud-bold'>
          ビューアー
        </Text>
      </Box>
      {/* ここに他のAppBarのコンテンツを追加 */}
      {children}
    </Flex>
  );
};

export default AppBar;
