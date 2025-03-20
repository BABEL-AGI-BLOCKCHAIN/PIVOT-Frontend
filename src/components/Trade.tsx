import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { usePreProcessing } from "src/hooks/usePreProcessing";
import { notification } from "antd";
import { readContract, waitForTransactionReceipt, writeContract } from "viem/actions";
import PivotTopicABI from "../contracts/PivotTopic_ABI.json";
import BigNumber from "bignumber.js";
import { cn, formatDecimal, getWagmiPublicClient, getWagmiWalletClient } from "src/utils";
import { maxUint256, formatUnits, parseUnits, Address } from "viem";
import { useAccount } from "wagmi";
import ERC20ABI from "../contracts/TopicERC20_ABI.json";
import { useContractAddress } from "src/hooks/useContractAddress";
import { TopicDetail } from "src/pages/TopicDetail";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ArrowUpRight, TrendingUp, Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import Decimal from "decimal.js";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";

interface TradeProps {
    topic: TopicDetail;
    getContractData: (topic: TopicDetail, isInitial?: boolean) => Promise<void>;
}

export default function Trade({ topic, getContractData }: TradeProps) {
    const { id } = useParams();
    const { chainId, address } = useAccount();
    const contractAddress = useContractAddress();
    const [investmentAmount, setInvestmentAmount] = useState("");
    const [activeTab, setActiveTab] = useState("invest");
    const [isPending, setIsPending] = useState(false);
    const [hash, setHash] = useState("");
    const [filter, setFilter] = useState<"all" | "withdrawable">("all");
    const filteredPositions = filter === "all" ? topic.myPositionsStats : topic.myPositionsStats?.filter((position) => new BigNumber(position.withdrawableAmount).gt(0));
    const publicClient = useMemo(() => getWagmiPublicClient(chainId), [chainId]);
    const preProcessing = usePreProcessing();

    const openNotificationWithIcon = (description: string) => {
        notification.error({
            message: "error",
            description,
            duration: 3,
        });
    };

    const checkInvestmentAmount = async (investmentAmount: string) => {
        if (Number(investmentAmount) > 0 && BigNumber(investmentAmount).mod(topic!.minimumInvestmentAmount).toNumber() == 0) {
            return true;
        }
        return false;
    };

    const checkBalance = async (paymentAmount: string) => {
        if (topic?.myTokenBalance && BigNumber(topic?.myTokenBalance).gte(paymentAmount)) {
            return true;
        }
        return false;
    };

    const handleInvestment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isPending) {
            return;
        }
        setIsPending(true);
        setHash("");
        try {
            await preProcessing();

            const tokenAddress = topic?.tokenAddress;
            const investmentAmountLocaleString = Number(investmentAmount).toLocaleString(undefined, { useGrouping: false, minimumFractionDigits: 0, maximumFractionDigits: 18 });

            if (!tokenAddress) {
                return;
            }

            if (!(await checkBalance(investmentAmountLocaleString))) {
                openNotificationWithIcon("Insufficient balance");
                setIsPending(false);
                return;
            }

            if (!(await checkInvestmentAmount(investmentAmountLocaleString))) {
                openNotificationWithIcon("It is not a multiple of the creator's investment amount");
                setIsPending(false);
                return;
            }

            const result = (await readContract(publicClient, {
                abi: ERC20ABI,
                address: tokenAddress,
                functionName: "allowance",
                args: [address, contractAddress],
            })) as bigint;

            console.log(investmentAmountLocaleString, formatUnits(result, topic.tokenDecimals));

            const walletClient = await getWagmiWalletClient();

            if (BigNumber(investmentAmountLocaleString).gt(formatUnits(result, topic.tokenDecimals))) {
                const hash = await writeContract(walletClient, {
                    address: tokenAddress,
                    abi: ERC20ABI,
                    functionName: "approve",
                    args: [contractAddress, maxUint256],
                });
                console.log({ hash });
                const res = await waitForTransactionReceipt(publicClient, { hash });
                console.log({ res });
            }

            const hash = await writeContract(walletClient, {
                address: contractAddress,
                abi: PivotTopicABI,
                functionName: "invest",
                args: [id, parseUnits(investmentAmountLocaleString, topic.tokenDecimals)],
            });
            setHash(hash);
            console.log({ hash });
            const res = await waitForTransactionReceipt(publicClient, { hash });
            console.log({ res });
            //navigate('/');
            setIsPending(false);

            notification.success({
                message: "success",
                description: "Successfully invested",
                duration: 3,
            });
            getContractData(topic);
        } catch (error: any) {
            console.log(error);
            const err = error?.cause?.shortMessage || error?.message || error;
            if (err) {
                openNotificationWithIcon(err.slice(0, 60));
            }
            setIsPending(false);
        }
    };

    if (!topic) {
        return <div className="loading">Loading...</div>;
    }

    function PositionItem({
        item,
    }: {
        item: {
            withdrawableAmount: string;
            totalIncome: string;
            position: number;
            investmentDate: string;
        };
    }) {
        const [isWithdrawalPending, setIsWithdrawalPending] = useState(false);
        const [withdrawalHash, setWithdrawalHash] = useState("");

        const handleWithdraw = async (e: React.FormEvent, position: number) => {
            e.preventDefault();
            if (isWithdrawalPending) {
                return;
            }
            setIsWithdrawalPending(true);
            setWithdrawalHash("");
            try {
                await preProcessing();

                const tokenAddress = topic?.tokenAddress;

                if (!tokenAddress) {
                    return;
                }

                const walletClient = await getWagmiWalletClient();

                const hash = await writeContract(walletClient, {
                    address: contractAddress,
                    abi: PivotTopicABI,
                    functionName: "withdraw",
                    args: [id, position],
                });
                setWithdrawalHash(hash);
                const res = await waitForTransactionReceipt(publicClient, { hash });
                console.log({ res });
                //navigate('/');
                setIsWithdrawalPending(false);

                notification.success({
                    message: "success",
                    description: "Successfully withdrawn",
                    duration: 3,
                });
                getContractData(topic);
            } catch (error: any) {
                console.log(error);
                const err = error?.cause?.shortMessage || error?.message || error;
                if (err) {
                    openNotificationWithIcon(err.slice(0, 60));
                }
                setIsWithdrawalPending(false);
            }
        };

        return (
            <Card key={item.position} className="overflow-hidden">
                <CardHeader className="pb-3">
                    <CardTitle className="text-xl">Position #{item.position}</CardTitle>
                    <CardDescription>Invested on {new Date(item.investmentDate).toLocaleDateString()}</CardDescription>
                </CardHeader>
                <CardContent className="py-2">
                    <div className="space-y-4">
                        <div className="flex items-center">
                            <Wallet className="h-5 w-5 mr-4 text-muted-foreground" />
                            <div className="space-y-0.5">
                                <p className="text-sm font-medium text-muted-foreground">Withdrawable Amount</p>
                                <p className="text-lg font-semibold">{formatDecimal(item.withdrawableAmount)}</p>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <TrendingUp className="h-5 w-5 mr-4 text-muted-foreground" />
                            <div className="space-y-0.5">
                                <p className="text-sm font-medium text-muted-foreground">Total Income</p>
                                <p className="text-lg font-semibold text-green-600">{formatDecimal(item.totalIncome)}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col">
                    {/* <Button className="w-full bg-green-600 text-white font-bold">Withdraw</Button> */}
                    <form onSubmit={(e) => handleWithdraw(e, item.position)} className="w-full">
                        <Button
                            type="submit"
                            disabled={!topic.tokenAddress || isWithdrawalPending || new BigNumber(item.withdrawableAmount).isEqualTo(0)}
                            className="bg-green-600 hover:bg-green-700 text-white w-full font-bold"
                        >
                            {isWithdrawalPending ? "Withdrawing..." : "Withdraw"}
                        </Button>
                    </form>

                    <div className={cn("mt-4 break-all", !withdrawalHash && "hidden")}>
                        Transaction Hash:
                        <div className="pt-2 text-sm text-gray-600">
                            {withdrawalHash}{" "}
                            <Link
                                to={`https://${process.env.REACT_APP_ENABLE_TESTNETS === "true" ? "sepolia." : ""}etherscan.io/tx/${withdrawalHash}`}
                                target="_blank"
                                className="inline-flex relative top-[3px]"
                            >
                                <ArrowUpRight className="h-[18px] text-blue-600" />
                            </Link>
                        </div>
                    </div>
                </CardFooter>
            </Card>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full grid grid-cols-2 bg-gray-100 p-1 h-auto">
                    <TabsTrigger value="invest" className="h-8 font-medium text-md">
                        Invest
                    </TabsTrigger>
                    <TabsTrigger value="withdraw" className="h-8 font-medium text-md">
                        Withdraw
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="invest" className="p-6">
                    <form onSubmit={handleInvestment} className="flex flex-col sm:flex-row gap-4">
                        <Input
                            type="number"
                            value={investmentAmount}
                            onChange={(e) => setInvestmentAmount(e.target.value)}
                            placeholder="Enter investment amount"
                            required
                            className="flex-1 border-gray-300"
                        />
                        <Button type="submit" disabled={!topic.tokenAddress || isPending} className="bg-green-600 hover:bg-green-700 text-white font-bold">
                            {isPending ? "Investing..." : "Invest"}
                        </Button>
                    </form>
                    {topic.minimumInvestmentAmount && (
                        <div className="flex gap-4 flex-wrap pt-6">
                            {Array.from({ length: 5 })
                                .fill(1)
                                .map((item, index) => (
                                    <div
                                        className="border border-gray-200 shadow-md px-4 py-2 cursor-pointer rounded-lg"
                                        onClick={() => {
                                            setInvestmentAmount(new Decimal(formatDecimal(topic.minimumInvestmentAmount)).times(index + 1).toString());
                                        }}
                                    >
                                        {new Decimal(formatDecimal(topic.minimumInvestmentAmount)).times(index + 1).toString()} {topic.tokenSymbol}
                                    </div>
                                ))}
                        </div>
                    )}
                    <div className={cn("mt-4 break-words", !hash && "invisible")}>
                        <div>Transaction Hash:</div>
                        <div className="pt-2 text-sm text-gray-600">
                            {hash}{" "}
                            <Link
                                to={`https://${process.env.REACT_APP_ENABLE_TESTNETS === "true" ? "sepolia." : ""}etherscan.io/tx/${hash}`}
                                target="_blank"
                                className="inline-flex relative top-[3px]"
                            >
                                <ArrowUpRight className="h-[18px] text-blue-600" />
                            </Link>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 mt-4">
                        <div className="flex gap-2 justify-between">
                            <span>Minimum Investment:</span>
                            <span className="">
                                {formatDecimal(topic.minimumInvestmentAmount)} {topic.tokenSymbol}
                            </span>
                        </div>

                        <div className="flex gap-2 justify-between">
                            <span>My Investment:</span>
                            <span className="">
                                {formatDecimal(topic.myInvestment)} {topic.tokenSymbol}
                            </span>
                        </div>

                        <div className="flex gap-2 justify-between">
                            <span>My Token Balance:</span>
                            <span className="">
                                {formatDecimal(topic.myTokenBalance)} {topic.tokenSymbol}
                            </span>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="withdraw" className="mt-0">
                    <div className="flex flex-col gap-4 p-6">
                        <div className="flex gap-2 justify-between">
                            <span>Withdrawable Amount:</span>
                            <span>
                                {formatDecimal(topic.myWithdrawableAmount)} {topic.tokenSymbol}
                            </span>
                        </div>
                        <div className="flex gap-2 justify-between">
                            <span>Total Income:</span>
                            <span>
                                {formatDecimal(topic.myTotalIncome)} {topic.tokenSymbol}
                            </span>
                        </div>
                        <div className="flex gap-2 justify-between">
                            <span>My Token Balance:</span>
                            <span>
                                {formatDecimal(topic.myTokenBalance)} {topic.tokenSymbol}
                            </span>
                        </div>
                        <div className="flex gap-2 justify-between">
                            <span>Withdrawal Fee:</span>
                            <span className="">0.3%</span>
                        </div>
                    </div>
                    <div className="pt-4 px-6 flex flex-col items-end justify-end ">
                        <div className="inline-flex items-center rounded-md mb-4 border border-gray-100">
                            <Button
                                // variant={filter === "all" ? "default" : "ghost"}
                                size="sm"
                                onClick={() => setFilter("all")}
                                className={`rounded-r-none rounded-l-md font-bold hover:bg-[#efefef] text-sm w-24 ${filter === "all" ? "!bg-green-600 !text-white" : ""}`}
                            >
                                All
                            </Button>

                            <Button
                                // variant={filter === "withdrawable" ? "default" : "ghost"}
                                size="sm"
                                onClick={() => setFilter("withdrawable")}
                                className={`rounded-l-none rounded-r-md font-bold hover:bg-[#efefef] text-sm ${filter === "withdrawable" ? "!bg-green-600 !text-white" : ""}`}
                            >
                                Withdrawable
                            </Button>
                        </div>
                        {/* <p className="text-sm text-muted-foreground">
                            {filter === "all" ? "Showing all investment positions" : "Showing investment positions with withdrawable amount greater than 0"}
                        </p> */}
                    </div>
                    <div className="grid gap-6 grid-cols-1 max-h-[50.5vh] overflow-auto px-6 pb-6">
                        {filteredPositions?.map((item) => (
                            <PositionItem item={item} />
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
