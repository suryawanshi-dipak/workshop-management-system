package com.workshop.order.controller;

import com.workshop.order.entity.Order;
import com.workshop.order.service.OrderService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin
public class OrderController {

    private final OrderService service;

    public OrderController(OrderService service) {
        this.service = service;
    }

    @PostMapping
    public Order createOrder(@RequestBody Order order) {
        return service.saveOrder(order);
    }

    // 🔍 SEARCH ORDER
    @GetMapping("/search")
    public Order searchOrder(
            @RequestParam(name = "orderNumber", required = false) String orderNumber,
            @RequestParam(name = "license", required = false) String license) {

        return service.searchOrder(orderNumber, license)
                .orElseThrow(() -> new RuntimeException("Order not found"));
    }
}
