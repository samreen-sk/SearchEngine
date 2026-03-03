package com.example.searchenginebackend.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaController {

    @GetMapping({
            "/",
            "/profiles",
            "/history",
            "/top",
            "/stored",
            "/admin-login",
            "/admin"
    })
    public String spaEntryPoint() {
        return "forward:/index.html";
    }
}
