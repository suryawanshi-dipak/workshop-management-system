package com.workshop.order.controller;

import com.workshop.order.dto.CreateOrderRequest;
import com.workshop.order.dto.CreateOrderResponse;
import com.workshop.order.entity.Order;
import com.workshop.order.service.OrderService;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:3000")
public class OrderController {

    private final OrderService service;

    public OrderController(OrderService service) {
        this.service = service;
    }

    // ✅ CREATE / UPDATE ORDER
    @PostMapping
    public Order saveOrder(@RequestBody Order order) {
        return service.saveOrder(order);
    }

    // 🔍 SEARCH ORDER
    @GetMapping("/search")
    public ResponseEntity<Order> searchOrder(
            @RequestParam(name = "orderNumber", required = false) String orderNumber,
            @RequestParam(name = "license", required = false) String license) {

        return service.searchOrder(orderNumber, license)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ➕ CREATE NEW ORDER NUMBER (preview)
    @GetMapping("/new")
    public Order createNewOrder() {
        return service.createNewOrder();
    }

    // ✅ GET ORDER BY ID (FIXED)
    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable Long id) {
        return service.getAllOrders().stream()
                .filter(o -> o.getId().equals(id))
                .findFirst()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ✅ GET ALL
    @GetMapping
    public List<Order> getAllOrders() {
        return service.getAllOrders();
    }

    // ✅ DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
        service.deleteOrder(id);
        return ResponseEntity.noContent().build();
    }

    // ✅ UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<Order> updateOrder(@PathVariable Long id, @RequestBody Order order) {
        order.setId(id);
        return ResponseEntity.ok(service.saveOrder(order));
    }

    // ✅ CREATE ORDER FROM PLANNING
    @PostMapping("/from-planning")
    public CreateOrderResponse createFromPlanning(@RequestBody CreateOrderRequest request) {

        System.out.println("/from-planning called");

        Order ord = service.createOrderFromPlanning(request);

        return new CreateOrderResponse(
                ord.getId(),
                ord.getOrderNumber()
        );
    }
}