import React, { useState, useEffect } from "react";
import {
  startIndexClient,
  startStoryServiceClient,
} from "../CanDBClient/client";
import { useParams } from "react-router-dom";
import {
  Container,
  Input,
  Flex,
  Spacer,
  Button,
  useColorModeValue,
  Menu,
  MenuButton,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  HStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormErrorMessage,
  createStandaloneToast,
  FormControl,
  useDisclosure,
  Divider,
  Center,
  Tooltip,
  Stack,
  Box,
  IconButton,
  Textarea,
  SimpleGrid,
  GridItem,
  Text,
} from "@chakra-ui/react";
import {
  TextColorDark,
  TextColorLight,
} from "../../containers/colormode/Colors";
import { LoadingSpinner } from "../../containers/index";
import PollSection from "./components/PollSection";

// author_ntohy-uex3p-ricj3-dhz7a-enmvo-szydx-l77yh-kftxf-h25x3-j6feg-2ae_story_putting%20a%20large%20story_chapter_vfebtrewb%20bgfdsbg

const unwrapStory = (data) => {
  for (let settledResult of data) {
    // handle settled result if fulfilled
    if (
      settledResult.status === "fulfilled" &&
      settledResult.value.length > 0
    ) {
      return Array.isArray(settledResult.value)
        ? settledResult.value[0]
        : settledResult.value;
    }
  }
};

const unwrapProposal = (data) => {
  for (let settledResult of data) {
    // handle settled result if fulfilled
    if (settledResult.status === "fulfilled" && "ok" in settledResult.value) {
      return Array.isArray(settledResult.value.ok)
        ? settledResult.value.ok[0]
        : settledResult.value.ok;
    }
  }
};

const SingleStory = () => {
  const params = useParams();
  const indexClient = startIndexClient();
  const storyServiceClient = startStoryServiceClient(indexClient);
  const storySortKey = params.storySortKey;

  const partitionKey = `user_${storySortKey.split("_")[1]}`;

  const [storyContent, setStoryContent] = useState({});
  const [proposalsArray, setProposalsArray] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const loadStory = async () => {
    const storyData = await storyServiceClient.query(partitionKey, (actor) =>
      actor.getStory(encodeURIComponent(storySortKey))
    );

    const result = unwrapStory(storyData);

    if (!result) return;
    let proposals = [];

    if (result.proposals > 1) {
      for (let i = 0; i < result.proposals; i++) {
        let proposalSK = `proposal_${i + 1}_for_${encodeURIComponent(
          storySortKey
        )}`;

        const proposal = await storyServiceClient.query(partitionKey, (actor) =>
          actor.getProposal(proposalSK)
        );

        proposals.push(unwrapProposal(proposal));
      }
    }

    setStoryContent(result);
    setProposalsArray(proposals);
    setLoaded(true);
  };

  useEffect(() => {
    loadStory();
  }, []);

  const textColor = useColorModeValue(TextColorLight, TextColorDark);
  const bgColor = useColorModeValue("white", "#111111");
  return (
    <Box py={{ base: 5, md: 5, lg: 12 }} pb={{ base: 10 }}>
      {loaded ? (
        <Center>
          <SimpleGrid
            columns={{ base: 1, lg: 2 }}
            templateColumns={{ base: "auto", lg: "1fr 500px" }}
          >
            <GridItem
              boxShadow={"lg"}
              bg={bgColor}
              p={{ base: 0, lg: 2 }}
              borderRadius="lg"
              ml={{ base: 0, lg: 20 }}
            >
              <Container minW={{ lg: "2xl" }} minH="2xl" color={textColor}>
                <Stack p={2} pb={4} align="center">
                  <Text
                    fontSize="34px"
                    fontFamily="'Times New Roman', Times, serif"
                    fontWeight="bold"
                    textAlign="center"
                  >
                    {decodeURIComponent(storyContent.groupName)}
                  </Text>
                  <Text
                    fontSize="28px"
                    fontFamily="'Times New Roman', Times, serif"
                    fontWeight="bold"
                    textAlign="center"
                  >
                    {decodeURIComponent(storyContent.title)}
                  </Text>
                </Stack>
                <Text
                  lineHeight={1.5}
                  fontSize={"21px"}
                  fontFamily="'Times New Roman', Times, serif"
                  dangerouslySetInnerHTML={{
                    __html: decodeURIComponent(storyContent.body),
                  }}
                  mb={20}
                />
              </Container>
            </GridItem>
            <GridItem>
              <Box
                pos={{ base: "auto", md: "sticky" }}
                top={{ base: "auto", md: "20" }}
              >
                {/* takes in an array of objects */}
                {storyContent.proposals > 1 ? (
                  <PollSection pollData={proposalsArray} />
                ) : null}
              </Box>
            </GridItem>
          </SimpleGrid>
        </Center>
      ) : (
        <LoadingSpinner label="fetching story..." />
      )}
    </Box>
  );
};

export default SingleStory;
