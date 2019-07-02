const generatePayload = (script) => ({
    settings: {
        optimizer: {
            enabled: true,
            runs: 200
        }
    },
    contractName: 'Payload',
    sources: {
        'Payload.sol': {
            content: getPayloadSource(script)
        }
    },
    version: 'v0.5.0+commit.1d4f565a'
});

export const getPayloadSource = (script) => (
`pragma solidity 0.5.0;

contract Payload {
    event TestEvent(uint a);
    function () external payable {
        emit TestEvent(5);
        ${script.replace(/\n/g, '\n\t\t')}
    }
}`);

export default generatePayload;