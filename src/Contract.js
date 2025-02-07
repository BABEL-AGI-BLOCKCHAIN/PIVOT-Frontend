// src/App.js
import React, { useState } from 'react';
import { useAccount,  useContractWrite } from 'wagmi';
import abi from './contracts/PivotTopic_metadata.json';

// 合约地址（替换为实际部署的合约地址）
const contractAddress = '0x9Af4f4b7C831b0c79574CCDE7C04e33F99BF6438';
// 在组件顶层调用 Hook
export function useTopicCreator() {
  const { writeAsync } = useContractWrite({
    address: contractAddress,
    abi: abi,
    functionName: 'createTopic',
  });

  return async (amount: string, erc20Address: string, topicHash: string) => {
    try {
      // 参数校验
      if (!ethers.utils.isAddress(erc20Address)) {
        throw new Error('Invalid ERC20 address');
      }

      // 转换参数
      const bnAmount = ethers.BigNumber.from(amount);
      const bytes32Topic = ethers.utils.formatBytes32String(topicHash);
      
      // 注意不同版本 Wagmi 的参数格式
      return await writeAsync({
        args: [bnAmount, erc20Address, bytes32Topic],
      });
    } catch (error) {
      console.error('Error creating topic:', error);
      throw error; // 建议抛出错误以便上层处理
    }
  };
}

// 在组件中使用
export default function MyComponent() {
  const createTopic = useTopicCreator();

  const handleClick = async () => {
    try {
      await createTopic(
        "1000000000000000000", // 1 ETH (假设是 18 decimals)
        "0x...", 
        "my-topic"
      );
    } catch (e) {
      // 处理错误
    }
  };
}