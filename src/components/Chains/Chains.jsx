import { useEffect, useState } from "react";
import { Menu, Dropdown, Button, Space } from "antd";
import { DownOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { AvaxLogo, PolygonLogo, BSCLogo, ETHLogo } from "./Logos";
import { useChain, useMoralis } from "react-moralis";

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

const menuItems = [
  {
    key: "0x1",
    value: "Ethereum",
    icon: <ETHLogo />,
  },
  {
    key: "0x539",
    value: "Local Chain",
    icon: <ETHLogo />,
  },
  {
    key: "0x3",
    value: "Ropsten Testnet",
    icon: <ETHLogo />,
  },
  {
    key: "0x4",
    value: "Rinkeby Testnet",
    icon: <ETHLogo />,
  },
  {
    key: "0x2a",
    value: "Kovan Testnet",
    icon: <ETHLogo />,
  },
  {
    key: "0x5",
    value: "Goerli Testnet",
    icon: <ETHLogo />,
  },
  {
    key: "0x38",
    value: "Binance",
    icon: <BSCLogo />,
  },
  {
    key: "0x61",
    value: "Smart Chain Testnet",
    icon: <BSCLogo />,
  },
  {
    key: "0x89",
    value: "Polygon",
    icon: <PolygonLogo />,
  },
  {
    key: "0x13881",
    value: "Mumbai",
    icon: <PolygonLogo />,
  },
  {
    key: "0xa86a",
    value: "Avalanche",
    icon: <AvaxLogo />,
  },
  {
    key: "0xa869",
    value: "Avalanche Testnet",
    icon: <AvaxLogo />,
  },
];

function Chains() {
  const { switchNetwork, chainId, chain } = useChain();
  const { isAuthenticated } = useMoralis();
  const [selected, setSelected] = useState({});

  console.log("chain", chain);

  useEffect(() => {
    console.log("!!! the chain has changed : " + chainId);

    if (!chainId) return null;
    const newSelected = menuItems.find((item) => item.key === chainId);

    console.log("!!! newSelected : " + newSelected);
    setSelected(newSelected);
    console.log("current chainId: ", chainId);
  }, [chainId]);

  const handleMenuClick = (e) => {
    console.log("switch to: ", e.key);

    try {
      switchNetwork(e.key);
    } catch (e) {
      console.log(e);
    }
  };

  const menu = (
    <Menu onClick={handleMenuClick}>
      {menuItems.map((item) => (
        <Menu.Item key={item.key} icon={item.icon} style={styles.item}>
          <span style={{ marginLeft: "5px" }}>{item.value}</span>
        </Menu.Item>
      ))}
    </Menu>
  );

  console.log("chainId : " + chainId);
  console.log("chain : " + chain);
  console.log("isAuthenticated : " + isAuthenticated);

  if (!chainId)
    return (
      <Space size="small" style={{ color: "red" }}>
        <ExclamationCircleOutlined />
        Install Wallet
      </Space>
    );

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

export default Chains;
