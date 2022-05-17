import React, { useEffect, useState } from "react";
import { Button, Dropdown, Menu, Space } from "antd";
import { DownOutlined } from "@ant-design/icons";
import Networks from "./Networks";
import detectEthereumProvider from "@metamask/detect-provider";


const styles = {
  item: {
    display: "flex",
    alignItems: "center",
    height: "42px",
    fontWeight: "500",
    fontFamily: "Roboto, sans-serif",
    fontSize: "14px",
    padding: "0 10px",
  },
  button: {
    border: "2px solid rgb(231, 234, 243)",
    borderRadius: "12px",
  },
};


function NetworkSwitch(props) {

  console.log("!!! NetworkSwitch : " + props);

  const [provider, setProvider] = useState({});
  const [selected, setSelected] = useState({});

  useEffect(async() => {
    console.log("!!! the chain has changed : " + props.chainId);

    if (!props.chainId) return null;
    setProvider(await getProvider());

    const newSelected = Networks().find((item) => item.key === props.chainId);

    console.log("!!! newSelected : " + newSelected);
    setSelected(newSelected);
    console.log("current chainId: ", props.chainId);
  }, [props.chainId]);


  const getProvider = async() => {

    let provider = await detectEthereumProvider();
    console.log("----- the PROVIDER IS "+provider);

    // edge case if MM and CoinbaseWallet are both installed
    try {
      if (window.ethereum.providers?.length) {
        window.ethereum.providers.forEach(async (p) => {
          if (p.isMetaMask) {
            console.log("setting provider to MM");
            provider = p;
          }
        });

      }
    } catch (e){}

    return provider;
  }

  const handleMenuClick = async(e) => {
    console.log("switch to: ", e.key);

    try {

      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: e.key }],
      });
    } catch (switchError) {

      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError.code === 4902) {
        try {
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: e.key,
                chainName: '...',
                rpcUrls: ['https://...'] /* ... */,
              },
            ],
          });
        } catch (addError) {
          // handle "add" error
          console.log("addError : "+JSON.stringify(addError));
        }

      } else if (switchError.code === -32002){
        //there are unfinished actions on the wallet
        console.log("need to open the wallet to finish previous tasks first ...");

      }

      // handle other "switch" errors
    }



  };

  const menu = (
    <Menu onClick={handleMenuClick}>
      {Networks().map((item) => (
        <Menu.Item key={item.key} icon={item.icon} style={styles.item}>
          <span style={{ marginLeft: "5px" }}>{item.value}</span>
        </Menu.Item>
      ))}
    </Menu>
  );

  console.log("the network switch menu : "+menu);

  return (
    <div>
      <Dropdown overlay={menu} trigger={["click"]}>
        <Button
          key={selected?.key}
          icon={selected?.icon}
          style={{ ...styles.button, ...styles.item }}
        >
          <span style={{ marginLeft: "5px" }}>{selected?.value}</span>
          <DownOutlined />
        </Button>
      </Dropdown>
    </div>
  );

}

export default NetworkSwitch;