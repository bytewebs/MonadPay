// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

contract MonadPay {
    struct Product {
        address merchant;
        uint256 price;
        address token;
        bool active;
    }

    mapping(bytes32 => Product) public products;

    event ProductCreated(bytes32 indexed productId, address indexed merchant, uint256 price, address token);
    event ProductUpdated(bytes32 indexed productId, uint256 price, bool active);
    event PaymentSuccess(bytes32 indexed productId, address indexed payer, uint256 amount, address token, bytes32 indexed txRef);

    address public owner;
    uint256 public platformFeeBps;
    address public feeRecipient;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    constructor(address _feeRecipient, uint256 _platformFeeBps) {
        owner = msg.sender;
        feeRecipient = _feeRecipient;
        platformFeeBps = _platformFeeBps;
    }

    function createProduct(bytes32 productId, uint256 price, address token) external {
        require(products[productId].merchant == address(0), "Exists");
        require(price > 0, "Invalid price");

        products[productId] = Product({
            merchant: msg.sender,
            price: price,
            token: token,
            active: true
        });

        emit ProductCreated(productId, msg.sender, price, token);
    }

    function updateProduct(bytes32 productId, uint256 newPrice, bool active) external {
        Product storage p = products[productId];
        require(p.merchant != address(0), "Not exists");
        require(msg.sender == p.merchant, "Not merchant");

        p.price = newPrice;
        p.active = active;

        emit ProductUpdated(productId, newPrice, active);
    }

    function payNative(bytes32 productId, bytes32 txRef) external payable {
        Product memory p = products[productId];
        require(p.merchant != address(0) && p.active, "Invalid product");
        require(p.token == address(0), "Token mismatch");
        require(msg.value == p.price, "Exact amount required");

        uint256 fee = _collectFee(msg.value);

        (bool sent,) = p.merchant.call{value: msg.value - fee}("");
        require(sent, "Transfer failed");

        emit PaymentSuccess(productId, msg.sender, msg.value, address(0), txRef);
    }

    function payERC20(bytes32 productId, bytes32 txRef) external {
        Product memory p = products[productId];
        require(p.merchant != address(0) && p.active, "Invalid product");
        require(p.token != address(0), "Not ERC20 product");

        uint256 amount = p.price;
        uint256 feeAmount = _applyFee(amount);

        if (feeAmount > 0) {
            require(IERC20(p.token).transferFrom(msg.sender, feeRecipient, feeAmount), "Fee transfer failed");
        }
        require(IERC20(p.token).transferFrom(msg.sender, p.merchant, amount - feeAmount), "Payment transfer failed");

        emit PaymentSuccess(productId, msg.sender, amount, p.token, txRef);
    }

    function _collectFee(uint256 amount) internal returns (uint256) {
        if (platformFeeBps == 0 || feeRecipient == address(0)) return 0;
        uint256 fee = (amount * platformFeeBps) / 10000;
        (bool sent,) = feeRecipient.call{value: fee}("");
        require(sent, "Fee transfer failed");
        return fee;
    }

    function _applyFee(uint256 amount) internal view returns (uint256) {
        if (platformFeeBps == 0 || feeRecipient == address(0)) return 0;
        return (amount * platformFeeBps) / 10000;
    }

    function setPlatformFee(uint256 bps) external onlyOwner {
        require(bps <= 1000, "Max 10%");
        platformFeeBps = bps;
    }

    function setFeeRecipient(address _recipient) external onlyOwner {
        feeRecipient = _recipient;
    }

    function emergencyWithdraw(address to, uint256 amount) external onlyOwner {
        (bool sent,) = to.call{value: amount}("");
        require(sent, "Withdraw failed");
    }

    receive() external payable {}
}
