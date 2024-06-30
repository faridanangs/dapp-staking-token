// SPDX-License-Identifier: UNLICENSEd
pragma solidity ^0.8.9;

interface IERC20 {
    event Transfer(address indexed to, uint256 amount);
    event Approval(address indexed from, address indexed to, uint256 amount);

    function balanceOf(address account) external view returns(uint256);

    function transfer(address to, uint256 amount) external returns(bool);

    function allowance(address owner, address spender) external view returns(uint256);

    function transferFrom(address from, address to, uint256  amount) external returns(bool);
}