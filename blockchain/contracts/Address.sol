// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

library Address {
    function isContract(address account) internal view returns (bool) {
        return account.code.length > 0;
    }

    function sendValue(address recipent, uint256 amount) internal {
        require(
            address(this).balance >= amount,
            "address: Insufficient balance"
        );

        (bool success, ) = payable(recipent).call{value: amount}("");
        require(
            success,
            "Address: unable to send value, recipent may have revert"
        );
    }

    function functionCall(
        address target,
        bytes memory data
    ) internal returns (bytes memory) {
        return functionCall(target, data, "Address: low-level call failed");
    }

    function functionCall(
        address target,
        bytes memory data,
        string memory errorMsg
    ) internal returns (bytes memory) {
        return functionCallWithValue(target, data, 0, errorMsg);
    }

    function functionCallWithValue(
        address target,
        bytes memory data,
        uint256 value
    ) internal returns (bytes memory) {
        return
            functionCallWithValue(
                target,
                data,
                value,
                "Address: Low-level call with value failed"
            );
    }

    function functionCallWithValue(
        address target,
        bytes memory data,
        uint256 value,
        string memory errorMsg
    ) internal returns (bytes memory) {
        require(
            address(this).balance >= value,
            "Address: Insufficient balance for call"
        );
        require(isContract(target), "Address: call to non-contract");

        (bool success, bytes memory returnData) = payable(target).call{
            value: value
        }(data);

        return verifyCallResult(success, returnData, errorMsg);
    }

    function functionStaticCall(
        address target,
        bytes memory data
    ) internal view returns (bytes memory) {
        return
            functionStaticCall(
                target,
                data,
                "Address: low-level static call failed"
            );
    }

    function functionStaticCall(
        address target,
        bytes memory data,
        string memory errorMsg
    ) internal view returns (bytes memory) {
        require(isContract(target), "Address: static call to non-contract");

        (bool success, bytes memory returnData) = target.staticcall(data);

        return verifyCallResult(success, returnData, errorMsg);
    }

    function functionDelegateCall(
        address target,
        bytes memory data
    ) internal returns (bytes memory) {
        return
            functionDelegateCall(
                target,
                data,
                "Address: low-level delegate call failed"
            );
    }

    function functionDelegateCall(
        address target,
        bytes memory data,
        string memory errorMsg
    ) internal returns (bytes memory) {
        require(isContract(target), "Address: static call to non-contract");

        (bool success, bytes memory returnData) = target.delegatecall(data);

        return verifyCallResult(success, returnData, errorMsg);
    }

    function verifyCallResult(
        bool success,
        bytes memory returnData,
        string memory errorMsg
    ) internal pure returns (bytes memory) {
        if (success) return returnData;
        else {
            if (returnData.length > 0) {
                assembly {
                    let returndata_size := mload(returnData)
                    revert(add(32, returnData), returndata_size)
                }
            } else {
                revert(errorMsg);
            }
        }
    }
}
