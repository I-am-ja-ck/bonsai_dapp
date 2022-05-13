import React from "react";
import { Select } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
// collection filters from tags:
const BonsaiWarriors = "bonsai warrior";
const BadbotNinja = "helmet";

export const SellingFilter = ({ setSelling }) => {
  return (
    <Select
      size="sm"
      border={"double"}
      borderRadius="lg"
      backgroundColor="#16171b"
      borderColor="#16171b"
      color="#f0e6d3"
      my={2}
      fontSize={["7pt", null, "sm"]}
      onChange={(e) => {
        setSelling(e.target.value);
      }}
    >
      <option value={"all"}>All</option>
      <option value={"selling"}>Selling</option>
      <option value={"notselling"}>Not Selling</option>
    </Select>
  );
};

// inventory filter for quick filtering of collections
export const CollectionFilter = ({ setCollection }) => {
  return (
    <Select
      size="sm"
      border={"double"}
      borderRadius="lg"
      backgroundColor="#16171b"
      borderColor="#16171b"
      color="#f0e6d3"
      my={2}
      fontSize={["7pt", null, "sm"]}
      onChange={(e) => {
        setCollection(e.target.value);
      }}
    >
      <option value={""}>All</option>
      <option value={BonsaiWarriors}>Bonsai Warriors</option>
      <option value={BadbotNinja}>Badbot Ninja</option>
    </Select>
  );
};

export const RarityFilter = ({ setSort }) => {
  return (
    <Select
      size="sm"
      border={"double"}
      borderRadius="lg"
      backgroundColor="#16171b"
      borderColor="#16171b"
      color="#f0e6d3"
      my={2}
      fontSize={["7pt", null, "sm"]}
      onChange={(e) => {
        setSort(e.target.value);
      }}
    >
      <option value={0}>All</option>
      <option value={1}>Common</option>
      <option value={2}>Uncommon</option>
      <option value={3}>Rare</option>
      <option value={4}>Epic</option>
      <option value={5}>Legendary</option>
      <option value={6}>Artifact</option>
    </Select>
  );
};

export const PriceFilter = ({ SetPrices }) => {
  // LtoH = low to high
  return (
    <Select
      size="sm"
      border={"double"}
      borderRadius="lg"
      backgroundColor="#16171b"
      borderColor="#16171b"
      color="#f0e6d3"
      my={2}
      fontSize={["7pt", null, "sm"]}
      onChange={(e) => {
        sePrices(e.target.value);
      }}
    >
      <option value={"LtoH"}>Price: Low to High</option>
      <option value={"HtoL"}>Price: High to Low</option>
    </Select>
  );
};

// filter for showing a specefic collection from an author in the marketplace
export const AuthorFilter = () => {
  const badbotPrices =
    "a004f41ea1a46f5b7e9e9639fbed84e037d9ce66b75d392d2c1640bb7a559cda";
  const bonsaiPrices = process.env.KONTRIBUTE_ADDRESS;

  const navigate = useNavigate();

  return (
    <Select
      size="sm"
      border={"double"}
      borderRadius="lg"
      backgroundColor="#16171b"
      borderColor="#16171b"
      color="#f0e6d3"
      my={2}
      fontSize={["7pt", null, "sm"]}
      onChange={(e) => {
        navigate("/marketplace/" + e.target.value);
      }}
    >
      <option value={process.env.MARKETPLACE_COLLECTION}>Latest</option>
      <option value={badbotPrices}>Badbot Ninja</option>
      <option value={bonsaiPrices}>Bonsai Warriors</option>
    </Select>
  );
};