package com.workshop.planning.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.workshop.planning.dto.CreateOrderRequestDTO;
import com.workshop.planning.dto.CreateOrderResponseDTO;

@FeignClient(name = "ORDER-SERVICE")
public interface OrderClient {

    @PostMapping("api/orders/from-planning")
    CreateOrderResponseDTO createOrder(@RequestBody CreateOrderRequestDTO requestDTO);
}
