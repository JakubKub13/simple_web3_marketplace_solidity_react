// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

contract Web3zon is Ownable {    

    struct Product {
        uint256 id;
        string name;
        string category;
        string img;
        uint256 cost;
        uint256 rating;
        uint256 stock;
    }

    struct Order {
        uint256 time;
        Product product;
    }

    mapping(uint256 => Product) public products;
    mapping(address => uint256) public orderCount;
    mapping(address => mapping(uint256 => Order)) public orders;

    event List(string name, uint256 const, uint256 quantity);
    event Buy(address buyer, uint256 orderId, uint256 itemId);


    constructor() {}

    function listProducts (
        uint256 _id, 
        string memory _name, 
        string memory _category,
        string memory _img,
        uint256 _cost,
        uint256 _rating,
        uint256 _stock
    ) external onlyOwner {
        Product memory newProduct = Product(
            _id,
            _name,
            _category,
            _img,
            _cost,
            _rating,
            _stock
        );

        products[_id] = newProduct;

        emit List(_name, _cost, _stock);
    }

    function buyProducts(uint256 _id) external payable {
        Product memory product = products[_id];
        require(msg.value >= product.cost, "Not enough funds");
        require(product.stock > 0, "Out of stock");

        Order memory newOrder = Order(
            block.timestamp,
            product
        );

        orderCount[msg.sender]++;
        orders[msg.sender][orderCount[msg.sender]] = newOrder;

        products[_id].stock = product.stock - 1;
        emit Buy(msg.sender, orderCount[msg.sender], product.id);
    }

    function withdraw() external onlyOwner {
        address _owner = owner();
        (bool success, ) = _owner.call{value: address(this).balance}("");
        require(success, "Failed to send Ether");
    }
}
