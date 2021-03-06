import React, {useEffect, useState} from "react";

import VaultAbi from "./ContractABIs/VaultAbi";
import { useMoralis, useMoralisWeb3Api } from "react-moralis";
import Moralis from "moralis";

import { Card, Button, Alert, Input } from "antd";

import GetUserAllowance from "./Contracts/USDC";
import USDCAbi from "./ContractABIs/USDCAbi";
import NumberFormat from "react-number-format";

const styles = {
  card: {
    boxShadow: "0 0.5rem 1.2rem rgb(189 197 209 / 20%)",
    border: "1px solid #e7eaf3",
    borderRadius: "1rem",
    fontSize: "16px",
    fontWeight: "500",
  },
  input: {

    fontWeight: "500",
    fontSize: "23px",
    display: "block",

    width: "100%",
    height: "30px",
    padding: "0 11px",
    textAlign: "left",
    backgroundColor: "transparent",
    border: "0",
    borderRadius: "2px",
    outline: "0",
    transition: "all 0.3s linear",
  },
  priceSwap: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "15px",
    color: "#434343",
    marginTop: "8px",
    padding: "0 10px",
  },
};

function Deposit(props) {
  console.log("Deposit : "+JSON.stringify(props));

  const Web3Api = useMoralisWeb3Api();
  const { authenticate, isAuthenticated } = useMoralis();

  /*
      for the Vault
   */
  const [ contractAddress ] = useState("0x886b2a3dc127c1122c005669f726d5d37a135411");

  /*
      for the User
   */
  const [ myVaultBalance, setMyVaultBalance ] = useState(0);
  const [ myAllowance, setMyAllowance ] = useState(0);
  const [ depositAmount, setDepositAmount ] = useState([]);
  const [ depositStatus, setDepositStatus ] = useState("");
  const [ errorMessage, setErrorMessage ] = useState("");

  console.log("------------------------ : "+props.chainId+" : "+props.currentAddress);

  useEffect(()=>{
    console.log("useEffect chainId and currentAddress : "+props.chainId+" : "+props.currentAddress);
    if (props.currentAddress !== ""){
      getUserDetails();
    }
    setErrorMessage("");
  }, [props.chainId, props.currentAddress]);


  //get user details
  async function getUserDetails() {
    console.log("getUserDetails : " + props.currentAddress);
    console.log("chainId : " + props.chainId);

    const balance_of_options = {
      chain: props.chainId,
      address: contractAddress,
      function_name: "balanceOf",
      abi: VaultAbi(),
      params: {
        '': props.currentAddress
      },
    };
    await Moralis.Web3API.native.runContractFunction(balance_of_options).then(result=>{
      console.log(JSON.stringify(result, null,'\t'));
      console.log("-------------- balance : "+result);
      console.log("My Vault Balance : "+result/1000000);
      setMyVaultBalance(result/1000000);

      console.log("Get the Allowance");
      const getMyAllowance = async() =>{
        setMyAllowance(await GetUserAllowance(props.chainId, props.currentAddress));
      }
      getMyAllowance();


    }).catch(error=>{
      //vault doesn't exist
      console.log(error);
      console.log(JSON.stringify(error, null,'\t'));
    });

  }




  function updateDepositAmount( event ) {
    setDepositAmount(event.target.value);
  }

  async function makeDeposit(){

    console.log("current approval amount : "+myAllowance/1000000);

    console.log("Checking allowance ..."+myAllowance);
    console.log("isAuthenticated ..."+isAuthenticated);

    //clear any error messages
    setErrorMessage("");

    console.log("parseInt(depositAmount) : "+parseInt(depositAmount));


    if (isNaN(parseFloat(depositAmount))){
      console.log("Only numbers and an optional decimal are allowed.");
      setErrorMessage("Only numbers and an optional single decimal are allowed.");
      //disable the button and show spinner
      setDepositStatus(false);

    } else if (parseFloat(depositAmount) <= 0) {
      console.log("Amount needs to be greater than zero.");
      setErrorMessage("Amount needs to be greater than zero.");
      setDepositStatus(false);

    } else {
      //it looks like it's ok to proceed

      //disable the button and show spinner
      setDepositStatus(true);

      //see if we need to set the allowance or increase it
      if (myAllowance < (parseInt(myVaultBalance+"000000")+parseInt(depositAmount+"000000"))){
        console.log("Need to set the user allowance first");

        const vaultAddress = "0x886b2a3dc127c1122c005669f726d5d37a135411";
        const USDCAddressRinkebyTestnet ="0x1717A0D5C8705EE89A8aD6E808268D6A826C97A4";
        const USDCAddressPolygonTestnet ="0x742DfA5Aa70a8212857966D491D67B09Ce7D6ec7";

        const USDCAddressPolygonMainnet = "0x2791bca1f2de4661ed88a30c99a7a9449aa84174";
        const USDCAddressAvalancheMainnet = "0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e";

        let addressToUse="";
        switch (props.chainId){
          case "0x4":
            addressToUse = USDCAddressRinkebyTestnet;
            break;
          case "0x13881":
            addressToUse = USDCAddressPolygonTestnet;
            break;
          case "0x89":
            addressToUse = USDCAddressPolygonMainnet;
            break;
          case "0xa86a":
            addressToUse = USDCAddressAvalancheMainnet;
            break;
          default:

        }

        console.log("addressToUse : "+addressToUse);

        if (!isAuthenticated) {

          await authenticate()
            .then(async function (user) {

              //ok to finish transaction
              const approveOptions = {
                contractAddress: addressToUse,
                functionName: "approve",
                abi: USDCAbi(),
                params: {
                  spender: vaultAddress,
                  amount: "123456789123456789123456789123456789",
                },
              };
              try {
                const transaction = await Moralis.executeFunction(approveOptions);
                console.log(transaction.hash);

                // Wait until the transaction is confirmed
                await transaction.wait();

                //update the allowance amount
                setMyAllowance("123456789123456789123456789123456789");

                //ok to finish transaction
                sendTransaction();

              } catch (e){
                console.log(e);
                setDepositStatus(false);
                return false;
              }

            })
            .catch(function (error) {
              console.log(error);
              setDepositStatus(false);
              props.setDepositSuccess(false);
            });

        } else {
          //already authenticated

          //ok to do approval
          const approveOptions = {
            contractAddress: addressToUse,
            functionName: "approve",
            abi: USDCAbi(),
            params: {
              spender: vaultAddress,
              amount: "123456789123456789123456789123456789",
            },
          };
          try {
            const transaction = await Moralis.executeFunction(approveOptions);
            console.log(transaction.hash);

            // Wait until the transaction is confirmed
            await transaction.wait();

            //update the allowance amount
            setMyAllowance("123456789123456789123456789123456789");

            console.log("Ready to make the deposit ...");

            //ok to finish transaction
            sendTransaction();

          } catch (e){
            console.log(JSON.stringify(e, null, '\t'));
            setDepositStatus(false);
            return false;
          }

        }

      } else {

        console.log("Ready to make the deposit : allowance already set ...");

        if (!isAuthenticated) {

          await authenticate()
            .then(async function (user) {

              //ok to finish transaction
              sendTransaction();

            })
            .catch(function (error) {
              console.log(error);
              setDepositStatus(false);
              props.setDepositSuccess(false);
            });

        } else {

          //ok to finish transaction
          sendTransaction();

        }
      }
    }

  }

  function sendTransaction(){
    console.log("sendTransaction");

    let depositThisAmount = parseFloat(depositAmount).toFixed(6);

    console.log("depositThisAmount : "+depositThisAmount);
    console.log("after getting rid of decimal : "+depositThisAmount.toString().replace('.', ''));


    const depositOptions = {
      contractAddress: contractAddress,
      functionName: "deposit",
      abi: VaultAbi(),
      params: {
        assets: depositThisAmount.toString().replace('.', ''),
        receiver: props.currentAddress,
      },
    };


    try {
      Moralis.executeFunction(depositOptions).then(result=>{
        console.log(JSON.stringify(result, null, '\t'));


        //update screen
        //send back the state updates
        props.setDepositSuccess(true);
        props.setDepositAmount(depositAmount);
        props.setDepositTransactionNumber(result.hash)

        //ready to enable the button and turn the spinner off
        setDepositStatus(false);
        setDepositAmount(0);

        //change to step 3


      }).catch(error=>{
        console.log(JSON.stringify(error, null, '\t'));
        setDepositStatus(false);

        if (error.code === -32603){
          //insufficient funds
          setErrorMessage("Insufficient funds in this account. Please add funds or choose another account");
        }
        if (error.code === 4001){
          //use canceled transaction

        }

        setDepositStatus(false);

      });

    } catch (e){
      console.log(e);
      setDepositStatus(false);
      setErrorMessage(e.message);
    }

  }


  useEffect(()=>{
    showErrorMessage();
  }, [errorMessage]);

  const showErrorMessage = () => {
    if (errorMessage===""){
      return null;
    } else {
      return (
        <Alert
          message="Error"
          description={errorMessage}
          type="error"
          showIcon
          closable
          style={{marginTop:"20px"}}
        />
      )
    }
  }


  return(
    <>
      <Card style={styles.card} bodyStyle={{ padding: "18px" }}>

        <div
          style={{ marginBottom: "5px", fontSize: "14px", color: "#434343"}}
        >
          Deposit
          <span
            style={{float:"right", cursor:"pointer", fontSize:"11px"}}
            onClick={()=>{
              setDepositAmount(props.myUSDCBalance);
            }}>
            <Button type="primary" shape="round" size="small">Max</Button>&nbsp;
            ($
                            <NumberFormat
                              value={props.myUSDCBalance>0?props.myUSDCBalance:0}
                              displayType={'text'}
                              thousandSeparator={true}
                              decimalScale={6}
                              fixedDecimalScale={true} />
              )
            </span>
        </div>
        <div
          style={{
            display: "flex",
            flexFlow: "row nowrap",
            width: "100%"
          }}
        >
          <div>
            <Input
              placeholder="0.00"
              size="large"
              bordered={false}
              onChange={updateDepositAmount}
              value={depositAmount}
              suffix="USDC"
              style={{paddingRight:"0",}}
            />
          </div>
        </div>
      </Card>

      <Button
        type="primary"
        size="large"
        style={{
          width: "100%",
          marginTop: "15px",
          borderRadius: "0.6rem",
          height: "50px",
        }}
        onClick={() => makeDeposit()}
        disabled={depositStatus}
        loading={depositStatus}
      >
        Deposit
      </Button>

      {showErrorMessage()}

    </>
  );
}

export default Deposit;


