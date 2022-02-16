import React, { useContext, useState, useContext, useEffect } from "react";
import NavBar from "../nav/NavBar";
import { Link } from "react-router-dom";

// Styling
import {
  Container,
  Center,
  Button,
  Flex,
  Box,
  Heading,
  Spacer,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from "@chakra-ui/react";
import { PlusSquareIcon } from "@chakra-ui/icons";
import { Fade, Bounce } from "react-awesome-reveal";
import "./BonsaiStory.css";

// user context from auth
import { UserContext } from "../../Context.jsx";

const BonsaiStory = () => {
  const { signActor } = useContext(UserContext);

  // the votes:
  const [vote1, setvote1] = useState("");
  const [vote2, setvote2] = useState("");
  const [vote3, setvote3] = useState("");

  const voteoption1 = async () => {
    setClick1(true);
    const user = await signActor();
    const vote = await user.VoteOption1();
    if (vote.toString() === "user has voted successfully on vote1") {
      setClick1(false);
      onClose1();
      return alert("Success! Thanks for voting");
    } else {
      setClick1(false);
      onClose1();
      return alert("Failed! You have already voted");
    }
  };

  const voteoption2 = async () => {
    setClick2(true);
    const user = await signActor();
    const vote = await user.VoteOption2();
    if (vote.toString() === "user has voted successfully on vote2") {
      setClick2(false);
      onClose2();
      return alert("Success! Thanks for voting");
    } else {
      setClick2(false);
      onClose2();
      return alert("Failed! You have already voted");
    }
  };

  const voteoption3 = async () => {
    setClick3(true);
    const user = await signActor();
    const vote = await user.VoteOption3();
    if (vote.toString() === "user has voted successfully on vote3") {
      setClick3(false);
      onClose3();
      return alert("Success! Thanks for voting");
    } else {
      setClick3(false);
      onClose3();
      return alert("Failed! You have already voted");
    }
  };

  // query the votes
  const getvote1 = async () => {
    const user = await signActor();
    const votes = await user.getVote1();
    setvote1(votes.toString());
  };

  const getvote2 = async () => {
    const user = await signActor();
    const votes = await user.getVote2();
    setvote2(votes.toString());
  };

  const getvote3 = async () => {
    const user = await signActor();
    const votes = await user.getVote3();
    setvote3(votes.toString());
  };

  // for modals
  const {
    isOpen: isOpen1,
    onOpen: onOpen1,
    onClose: onClose1,
  } = useDisclosure();
  const {
    isOpen: isOpen2,
    onOpen: onOpen2,
    onClose: onClose2,
  } = useDisclosure();
  const {
    isOpen: isOpen3,
    onOpen: onOpen3,
    onClose: onClose3,
  } = useDisclosure();

  useEffect(() => {
    getvote1();
    getvote2();
    getvote3();
  }, []);

  // button state for clicks
  const [isClicked1, setClick1] = useState(false);
  const [isClicked2, setClick2] = useState(false);
  const [isClicked3, setClick3] = useState(false);

  return (
    <div>
      <NavBar />
      <div className="bonsai__story_heading">
        <Center>
          <h1>Bonsai Warriors</h1>
        </Center>
        <Center>
          <h5>Prologue</h5>
        </Center>
      </div>
      <Fade>
        <Container>
          <div className="bonsai__story">
            Dolor amet eu occaecat excepteur do adipisicing cillum duis. Est
            ullamco ullamco sit ea irure consequat id do ex enim consectetur
            nisi duis elit. Qui mollit magna exercitation est sit. Dolor amet eu
            occaecat excepteur do adipisicing cillum duis. Est ullamco ullamco
            sit ea irure consequat id do ex enim consectetur nisi duis elit. Qui
            mollit magna exercitation est sit. Dolor amet eu occaecat excepteur
            do adipisicing cillum duis. Est ullamco ullamco sit ea irure
            consequat id do ex enim consectetur nisi duis elit. Qui mollit magna
            exercitation est sit. Dolor amet eu occaecat excepteur do
            adipisicing cillum duis. Est ullamco ullamco sit ea irure consequat
            id do ex enim consectetur nisi duis elit. Qui mollit magna
            exercitation est sit. Dolor amet eu occaecat excepteur do
            adipisicing cillum duis. Est ullamco ullamco sit ea irure consequat
            id do ex enim consectetur nisi duis elit. Qui mollit magna
            exercitation est sit. Dolor amet eu occaecat excepteur do
            adipisicing cillum duis. Est ullamco ullamco sit ea irure consequat
            id do ex enim consectetur nisi duis elit. Qui mollit magna
            exercitation est sit. Dolor amet eu occaecat excepteur do
            adipisicing cillum duis. Est ullamco ullamco sit ea irure consequat
            id do ex enim consectetur nisi duis elit. Qui mollit magna
            exercitation est sit. Dolor amet eu occaecat excepteur do
            adipisicing cillum duis. Est ullamco ullamco sit ea irure consequat
            id do ex enim consectetur nisi duis elit. Qui mollit magna
            exercitation est sit. Dolor amet eu occaecat excepteur do
            adipisicing cillum duis. Est ullamco ullamco sit ea irure consequat
            id do ex enim consectetur nisi duis elit. Qui mollit magna
            exercitation est sit. Dolor amet eu occaecat excepteur do
            adipisicing cillum duis. Est ullamco ullamco sit ea irure consequat
            id do ex enim consectetur nisi duis elit. Qui mollit magna
            exercitation est sit. Dolor amet eu occaecat excepteur do
            adipisicing cillum duis. Est ullamco ullamco sit ea irure consequat
            id do ex enim consectetur nisi duis elit. Qui mollit magna
            exercitation est sit. Dolor amet eu occaecat excepteur do
            adipisicing cillum duis. Est ullamco ullamco sit ea irure consequat
            id do ex enim consectetur nisi duis elit. Qui mollit magna
            exercitation est sit. Dolor amet eu occaecat excepteur do
            adipisicing cillum duis. Est ullamco ullamco sit ea irure consequat
            id do ex enim consectetur nisi duis elit. Qui mollit magna
            exercitation est sit.
          </div>
        </Container>
      </Fade>
      <div className="bonsai__vote">
        <Center>
          <h5>You choose what happens next!</h5>
        </Center>
      </div>
      <Container mt="4">
        <Flex mb="4">
          <Box p="2">
            <Heading size="md" color="#c8aa6e">
              Option Title
            </Heading>
          </Box>
          <Spacer />
          <Box>
            <Button onClick={onOpen1} mr="2" colorScheme="#f0e6d3" bg="#282828">
              Read option 1&nbsp;
            </Button>
            <Modal isOpen={isOpen1} onClose={onClose1}>
              <ModalOverlay />
              <ModalContent bg="#0a0a0d">
                <ModalHeader color="#c8aa6e">Option 1</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  <div className="bonsai__story">
                    This is the text for option 1
                  </div>
                </ModalBody>

                <ModalFooter>
                  {!isClicked1 ? (
                    <Button
                      onClick={() => voteoption1()}
                      rightIcon={<PlusSquareIcon />}
                      bg="#17191e"
                      border="1px"
                      borderColor="#9d8144"
                      color="#f0e6d3"
                      colorScheme="#17191e"
                      mr="4"
                    >
                      Place Vote
                    </Button>
                  ) : null}
                  {isClicked1 ? (
                    <Bounce>
                      <Button
                        isLoading
                        onClick={() => voteoption1()}
                        rightIcon={<PlusSquareIcon />}
                        bg="#17191e"
                        border="1px"
                        borderColor="#9d8144"
                        color="#f0e6d3"
                        colorScheme="#17191e"
                        mr="4"
                      >
                        Place Vote
                      </Button>
                    </Bounce>
                  ) : null}
                  <Button
                    colorScheme="black"
                    color="#f0e6d3"
                    variant="outline"
                    mr={3}
                    onClick={onClose1}
                  >
                    Close
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>

            <Box
              as="button"
              borderRadius="md"
              bg="#0fbdde"
              color="black"
              fontWeight="semibold"
              px={4}
              h={8}
            >
              {vote1}
            </Box>
          </Box>
        </Flex>

        <Flex mb="4">
          <Box p="2">
            <Heading size="md" color="#c8aa6e">
              Option Title
            </Heading>
          </Box>
          <Spacer />
          <Box>
            <Button onClick={onOpen2} mr="2" colorScheme="#f0e6d3" bg="#282828">
              Read option 2
            </Button>
            <Modal isOpen={isOpen2} onClose={onClose2}>
              <ModalOverlay />
              <ModalContent bg="#0a0a0d">
                <ModalHeader color="#c8aa6e">Option 2</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  <div className="bonsai__story">
                    this is the text for option 2
                  </div>
                </ModalBody>

                <ModalFooter>
                  {!isClicked2 ? (
                    <Button
                      onClick={() => voteoption2()}
                      rightIcon={<PlusSquareIcon />}
                      bg="#17191e"
                      border="1px"
                      borderColor="#9d8144"
                      color="#f0e6d3"
                      colorScheme="#17191e"
                      mr="4"
                    >
                      Place Vote
                    </Button>
                  ) : null}
                  {isClicked2 ? (
                    <Bounce>
                      <Button
                        isLoading
                        onClick={() => voteoption2()}
                        rightIcon={<PlusSquareIcon />}
                        bg="#17191e"
                        border="1px"
                        borderColor="#9d8144"
                        color="#f0e6d3"
                        colorScheme="#17191e"
                        mr="4"
                      >
                        Place Vote
                      </Button>
                    </Bounce>
                  ) : null}
                  <Button
                    colorScheme="black"
                    color="#f0e6d3"
                    variant="outline"
                    mr={3}
                    onClick={onClose2}
                  >
                    Close
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>

            <Box
              as="button"
              borderRadius="md"
              bg="#0fbdde"
              color="black"
              fontWeight="semibold"
              px={4}
              h={8}
            >
              {vote2}
            </Box>
          </Box>
        </Flex>

        <Flex mb="4">
          <Box p="2">
            <Heading size="md" color="#c8aa6e">
              Option Title
            </Heading>
          </Box>
          <Spacer />
          <Box>
            <Button onClick={onOpen3} mr="2" colorScheme="#f0e6d3" bg="#282828">
              Read option 3
            </Button>
            <Modal isOpen={isOpen3} onClose={onClose3}>
              <ModalOverlay />
              <ModalContent bg="#0a0a0d">
                <ModalHeader color="#c8aa6e">Option 3</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  <div className="bonsai__story">
                    this is the text for option 3
                  </div>
                </ModalBody>

                <ModalFooter>
                  {!isClicked3 ? (
                    <Button
                      onClick={() => voteoption3()}
                      rightIcon={<PlusSquareIcon />}
                      bg="#17191e"
                      border="1px"
                      borderColor="#9d8144"
                      color="#f0e6d3"
                      colorScheme="#17191e"
                      mr="4"
                    >
                      Place Vote
                    </Button>
                  ) : null}
                  {isClicked3 ? (
                    <Bounce>
                      <Button
                        isLoading
                        onClick={() => voteoption3()}
                        rightIcon={<PlusSquareIcon />}
                        bg="#17191e"
                        border="1px"
                        borderColor="#9d8144"
                        color="#f0e6d3"
                        colorScheme="#17191e"
                        mr="4"
                      >
                        Place Vote
                      </Button>
                    </Bounce>
                  ) : null}
                  <Button
                    colorScheme="black"
                    color="#f0e6d3"
                    variant="outline"
                    mr={3}
                    onClick={onClose3}
                  >
                    Close
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>

            <Box
              as="button"
              borderRadius="md"
              bg="#0fbdde"
              color="black"
              fontWeight="semibold"
              px={4}
              h={8}
            >
              {vote3}
            </Box>
          </Box>
        </Flex>
      </Container>
      <div className="bonsai__story_back-button">
        <Link to="/stories">
          <button type="button">Go back</button>
        </Link>
      </div>
    </div>
  );
};

export default BonsaiStory;