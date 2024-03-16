import { ClientProtocolId } from "frames.js";
import {
  FrameButton,
  FrameContainer,
  FrameImage,
  NextServerPageProps,
  getFrameMessage,
  getPreviousFrame,
} from "frames.js/next/server";
import { getXmtpFrameMessage, isXmtpFrameActionPayload } from "frames.js/xmtp";
import { DEBUG_HUB_OPTIONS } from "./debug/constants";

const acceptedProtocols: ClientProtocolId[] = [
  {
    id: "xmtp",
    version: "vNext",
  },
  {
    id: "farcaster",
    version: "vNext",
  },
];

// This is a react server component only
export default async function Home({
  params,
  searchParams,
}: NextServerPageProps) {
  const previousFrame = getPreviousFrame(searchParams);

  let fid: number | undefined;
  let walletAddress: string | undefined;
  let walletAddresses: string[];

  if (
    previousFrame.postBody &&
    isXmtpFrameActionPayload(previousFrame.postBody)
  ) {
    const frameMessage = await getXmtpFrameMessage(previousFrame.postBody);
    walletAddress = frameMessage?.verifiedWalletAddress;
  } else {
    const frameMessage = await getFrameMessage(
      previousFrame.postBody,
      DEBUG_HUB_OPTIONS
    );

    if (frameMessage && frameMessage?.isValid) {
      fid = frameMessage?.requesterFid;
      walletAddress =
        frameMessage?.requesterCustodyAddress.length > 0 ?
          frameMessage?.requesterCustodyAddress :
          frameMessage?.requesterCustodyAddress
    }
  }

  return (
    <div>
      <FrameContainer
        postUrl="/frames"
        pathname="/"
        state={{}}
        previousFrame={previousFrame}
        accepts={acceptedProtocols}
      >
        <FrameImage>
          <div tw="flex flex-col" style={{ backgroundColor: "#01153B", width: "100%", height: "100%", paddingLeft: 16, paddingRight: 16, textAlign: 'center', fontFamily: 'sans-serif' }}>
            {walletAddress === undefined && <div tw="flex">
              <p style={{ color: "#F4D35E", fontSize: 40 }}>You will receive an NFT to install the ham widget</p>
              <p style={{ color: "#F4D35E", fontSize: 40 }}>Limited to only 100 users</p>
            </div>}
            {walletAddress && (
              <div tw="flex">
                <p style={{ color: "#F4D35E", fontSize: 40 }}>Thank you!</p>
                <p style={{ color: "#F4D35E", fontSize: 40 }}>You will receive your NFT for the ham widget in the following address:
                  {walletAddress}
                </p>
              </div>
            )}
          </div>
        </FrameImage>
        <FrameButton>{walletAddress ? "Next" : "Done"}</FrameButton>
      </FrameContainer>
    </div >
  );
}
