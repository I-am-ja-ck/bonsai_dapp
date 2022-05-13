import React, { useState, useEffect } from "react";
import {
  Center,
  SimpleGrid,
  HStack,
  Flex,
  Spacer,
  Center,
  Heading,
  Container,
  useBreakpointValue,
  Divider,
  Text,
  Wrap,
  Stack,
  Button,
} from "@chakra-ui/react";
import { SingleNft } from "../components";
import { LoadingSpinner } from "../../containers";
import * as AccountIdentifier from "@vvv-interactive/nftanvil-tools/cjs/accountidentifier.js";
import { AuthorFilter, PriceFilter, RarityFilter } from "../components/Filters";
import { useParams } from "react-router-dom";
import LazyLoad from "react-lazyload";

const Marketplace = () => {
  const params = useParams();
  const [Loaded, setLoaded] = useState(false);
  const [tokensForSale, setTokensForSale] = useState([]);
  const [sortBy, setSort] = useState("0");
  const [page, setPage] = useState(0);
  const [amount, setAmount] = useState(12);

  const sortRarity = async (allTokens, rarity) => {
    setPage(0)
    let author = await fetch(
      "https://nftpkg.com/api/v1/author/" + params.author
    ).then((x) => x.json());

    let rarityFiltered = [];
    for (let i = 0; i < author.length; i++) {
      if (author[i][1] === Number(rarity)) {
        rarityFiltered.push(author[i][0]);
      }
    }

    let filtered = [];
    for (let i = 0; i < allTokens.length; i++) {
      if (rarityFiltered.includes(allTokens[i])) {
        filtered.push(allTokens[i]);
      }
    }

    return filtered;
  };

  const LoadSale = async () => {
    let forSale = [];
    let jsonData = await fetch(
      "https://nftpkg.com/api/v1/prices/" + params.author
    ).then((x) => x.json());

    for (let i = 0; i < jsonData.length; i++) {
      if (jsonData[i][2] > 0) {
        forSale.push(jsonData[i][0]);
      }
    }

    if (sortBy === "0") {
      setTokensForSale(forSale.slice(page * 8, (page + 1) * 8));
    } else {
      let filtered = await sortRarity(forSale, sortBy);

      setTokensForSale(filtered.slice(page * 8, (page + 1) * 8));
    }

    if (!Loaded) setLoaded(true);
  };

  useEffect(() => {
    LoadSale();
  }, [params.author, page, sortBy]);

  if (!Loaded) return <LoadingSpinner label="Loading Marketplace" />;
  return (
    <div>
      <MarketplaceHeader setSort={setSort} />
      <Center my={2}>
        <PaginationButtons
          setPage={setPage}
          page={page}
          tokensLength={tokensForSale.length}
        />
      </Center>
      <Center mt={1}>
        <SimpleGrid columns={[2, null, 4]} pb={5} gap={2} mx={2} maxW="1250px">
          {tokensForSale.map((item) => (
            <SingleNft
              tokenId={item}
              key={item}
              sort={sortBy.toString()}
              collection={""}
              selling={"all"}
              isMarketplace={true}
            />
          ))}
        </SimpleGrid>
      </Center>
      <Center mb={2} mt={-2}>
        <PaginationButtons
          setPage={setPage}
          page={page}
          tokensLength={tokensForSale.length}
        />
      </Center>
    </div>
  );
};

const MarketplaceHeader = ({ setSort, setCollection }) => {
  return (
    <Container maxWidth="1250px" mt={-8}>
      <Flex alignItems="center" gap="2">
        <Heading size={useBreakpointValue({ base: "xs", md: "lg" })}>
          <Wrap align={"center"}>
            <Text bgGradient="linear(to-t, #705025, #a7884a)" bgClip="text">
              Kontribute{" "}
            </Text>
            <Text>Marketplace</Text>
          </Wrap>
        </Heading>
        <Spacer />
        <HStack>
          <AuthorFilter />
          <RarityFilter setSort={setSort} />
          <PriceFilter />
        </HStack>
      </Flex>
      <Divider my={1} borderColor="#16171b" />
    </Container>
  );
};
export default Marketplace;

const PaginationButtons = ({ setPage, page, tokensLength }) => {
  return (
    <Stack
      direction={"row"}
      spacing={3}
      align={"center"}
      alignSelf={"center"}
      position={"relative"}
    >
      <Button
        size="xs"
        colorScheme="#282828"
        bg="#282828"
        rounded={"full"}
        px={6}
        _hover={{ opacity: "0.8" }}
        isDisabled={page === 0}
        onClick={() => {
          setPage(page - 1);
        }}
      >
        Prev Page
      </Button>
      <Button
        size="xs"
        colorScheme="#282828"
        bg="#282828"
        rounded={"full"}
        px={6}
        _hover={{ opacity: "0.8" }}
        isDisabled={tokensLength < 8}
        onClick={() => {
          setPage(page + 1);
        }}
      >
        Next Page
      </Button>
    </Stack>
  );
};
