#include <curlpp/cURLpp.hpp>
#include <curlpp/Easy.hpp>
#include <curlpp/Options.hpp>
#include <curlpp/Infos.hpp>

#include <json/json.h>
#include <json/reader.h>
#include <json/writer.h>
#include <json/value.h>

#include <iostream>
#include <chrono>
#include <thread>

using namespace curlpp::options;

#define sleep(x) std::this_thread::sleep_for(std::chrono::milliseconds(x));

char* base_url = "http://0.0.0.0:8080/";
std::string version = "1.0.0";

curlpp::Cleanup cleaner;
curlpp::Easy req;

std::string get(std::string route)
{
    std::stringstream result;

    std::string url = base_url + route;

    try
	{
        req.setOpt(Url(url));
        req.setOpt(Verbose(false));
        req.setOpt(cURLpp::Options::WriteStream(&result));

        req.perform();
	}
	catch(curlpp::RuntimeError & e)
	{
		std::cout << e.what() << std::endl;
        exit(-1);
	}

	catch(curlpp::LogicError & e)
	{
		std::cout << e.what() << std::endl;
        exit(-2);
	} 

    std::string data;
    result >> data;
    return data;
};

int main()
{
    Json::Reader builder;
    Json::Value versions;

    builder.parse(get("api/version/" + version) , versions);

    if(versions["approved"].asString() == "false")
    {
        std::cout << "Invalid version" << std::endl;
        return 0;
    }
    
    std::cout << "Update available: " << !versions["latest"] << std::endl;    

    std::string hash = "none";
    builder.parse(get("api/version/" + version + "/" + hash), versions);
    
    if(versions["approved"].asString() == "false")
    {
        std::cout << "Invalid hash" << std::endl;
        return 0;
    }
}
